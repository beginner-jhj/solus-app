import {create} from "zustand";
import {setState} from "../../store/store.js";
import {
    initDB,
    saveConversation,
    loadConversationHistory,
    generateChatId
} from "../../lib/lib.js";

// Initialize DB connection
initDB().then(() => {
    console.log("Database initialized");
    // You might want to trigger initial data loading here if needed immediately
    // For example, by calling a method from the store if it's already created
    // or by setting up a flag that indicates DB is ready.
}).catch(console.error);

export const assistantPageStore = create((set,get) => ({
    isChatStarting: false,
    setIsChatStarting: (arg) => setState(set,get,"isChatStarting",arg),
    chatHistory: [],
    setChatHistory: (newMessage) => {
      // --- Synchronous Part ---
      const oldState = get(); // Get current state for decision making
      let determinedChatId = oldState.currentChatId;
      let determinedSummary = "";
      let isNewChatIdBeingSet = false;
      let summaryActuallyChanged = false;

      if (!determinedChatId) { // Case 1: No currentChatId, so this is the first message of a new session
        determinedChatId = generateChatId();
        isNewChatIdBeingSet = true;
        if (newMessage.type === "user" && newMessage.data && newMessage.data.text) {
          determinedSummary = newMessage.data.text.substring(0, 50);
        } else if (newMessage.type === "assistant" && newMessage.data) {
          determinedSummary = newMessage.data.summary ||
                              newMessage.data.user_intent_summary ||
                              (newMessage.data.response ? newMessage.data.response.substring(0, 50) : "Assistant Chat");
        } else {
          determinedSummary = "Chat"; // Fallback for a new chat
        }
        summaryActuallyChanged = true; // A new summary is established
      } else { // Case 2: currentChatId exists, this is an ongoing conversation
        const existingSummaryObj = oldState.conversationSummaries.find(s => s.id === determinedChatId);
        determinedSummary = existingSummaryObj ? existingSummaryObj.summary : "Chat Conversation"; // Default if not found

        // Check if we need to update a "New Chat" placeholder summary
        // This happens if the current chat's summary is "New Chat" AND
        // this is the first message being added to its history (history was empty before this message).
        if (determinedSummary === "New Chat" &&
            newMessage.type === "user" &&
            newMessage.data &&
            newMessage.data.text &&
            oldState.chatHistory.length === 0) {
          determinedSummary = newMessage.data.text.substring(0, 50);
          summaryActuallyChanged = true; // The "New Chat" summary is updated
        }
        // Otherwise, for existing chats with established summaries, determinedSummary remains as fetched,
        // and summaryActuallyChanged remains false.
      }

      // Perform the synchronous state update
      set(state => ({
        chatHistory: [...state.chatHistory, newMessage],
        currentChatId: determinedChatId // Update currentChatId if it was newly generated
      }));

      // --- Asynchronous Part ---
      // Use an immediately invoked async function (IIFE)
      (async () => {
        const newState = get(); // Get the absolute latest state after the set operation
        await saveConversation({
          id: newState.currentChatId, // Use the ID from the potentially updated state
          summary: determinedSummary,
          history: newState.chatHistory
        });

        // Fetch summaries only if a new chat was created OR if the summary was actually changed
        // (e.g. "New Chat" was updated, or a brand new chat got its initial summary)
        if (isNewChatIdBeingSet || summaryActuallyChanged) {
          await newState.fetchConversationSummaries();
        }
      })();
    },
    message: "",
    setMessage: (arg) => setState(set,get,"message",arg),
    isLoading: false,
    setIsLoading: (arg) => setState(set,get,"isLoading",arg),

    // New state variables for IndexedDB integration
    currentChatId: null,
    conversationSummaries: [],

    createNewChat: async () => {
        const newId = generateChatId();
        set({ currentChatId: newId, chatHistory: [], message: "", isChatStarting: true });
        try {
            // Save a placeholder conversation
            await saveConversation({ id: newId, summary: "New Chat", history: [] });
            // Refresh the list of conversation summaries
            await get().fetchConversationSummaries();
        } catch (error) {
            console.error("Failed to create and save new chat:", error);
        }
    },

    switchConversation: async (chatId) => {
        if (!chatId) {
            console.warn("switchConversation called with null or undefined chatId");
            // Optionally, create a new chat or load a default
            // For now, just ensure a valid currentChatId exists or create one
            if (!get().currentChatId) {
                get().createNewChat(); // This will also fetch summaries
            }
            return;
        }

        if (get().currentChatId === chatId) {
            return; // Already on this conversation
        }

        set({ isLoading: true });
        try {
            const history = await loadConversationHistory(chatId);
            const currentConversation = get().conversationSummaries.find(conv => conv.id === chatId);

            set({
                currentChatId: chatId,
                chatHistory: history || [],
                message: "",
                // isChatStarting should be true if history is empty, or based on your app's logic
                isChatStarting: (history || []).length === 0,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to switch conversation:", error);
            set({ isLoading: false });
            // Potentially handle the error by, e.g., creating a new chat
            // get().createNewChat();
        }
    },

    // Action to fetch conversation summaries
    fetchConversationSummaries: async () => {
        try {
            const summaries = await loadConversationHistory();
            set({ conversationSummaries: summaries });
            return summaries; // Return for potential chaining or direct use
        } catch (error) {
            console.error("Failed to fetch conversation summaries:", error);
            set({ conversationSummaries: [] }); // Set to empty on error
            return [];
        }
    },

    // Initial store setup logic
    initStore: async () => {
        const summaries = await get().fetchConversationSummaries();
        if (get().currentChatId === null && summaries.length === 0) {
            // If there are no conversations and no current ID, create a new one.
            const newId = generateChatId();
            set({ currentChatId: newId });
            // Save this initial new chat so it exists in DB from the start
            try {
                await saveConversation({ id: newId, summary: "New Chat", history: [] });
                await get().fetchConversationSummaries(); // Refresh summaries to include this new one
            } catch (error) {
                console.error("Failed to save initial new chat:", error);
            }
        } else if (get().currentChatId === null && summaries.length > 0) {
            // If there are conversations but no currentChatId (e.g. first load),
            // you could set currentChatId to the most recent one.
            // For now, we'll let switchConversation or user action handle explicit loading.
            // Or, simply set to the first available summary's ID if desired.
            // set({ currentChatId: summaries[0].id }); // Example: load first one
            // await get().switchConversation(summaries[0].id); // And load its history
        }
        // If currentChatId is already set (e.g. from a previous session restore if you implement that),
        // you might want to ensure its history is loaded here or rely on user action.
    }
}));

// Call initStore after the store is created.
// Zustand's `create` function runs synchronously, so `assistantPageStore` is defined.
// We need to access methods on the store, so we do it after `create`.
const useStore = assistantPageStore; // Standard way to get the hook
const storeApi = useStore.getState(); // Get the store API (getState, setState, subscribe)

// Initialize the store after it's fully created
storeApi.initStore().catch(console.error);
