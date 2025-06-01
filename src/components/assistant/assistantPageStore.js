import {create} from "zustand";
import {setState} from "../../store/store.js";
import {
    initDB,
    saveConversation,
    loadConversations,
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
    isStoreInitialized: false, // Added flag
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
            console.error("switchConversation called with invalid chatId:", chatId);
            set({ isLoading: false }); // Ensure loading is stopped
            // Do NOT automatically call createNewChat here if it's part of a loop.
            // Let the UI or a more stable recovery mechanism handle this.
            // If there's truly no currentChatId, initStore's logic for empty state
            // should eventually create one without switchConversation forcing it in a loop.
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
        // isLoading is typically set to true by the caller of this function (e.g. initStore)
        // This function's responsibility is to set isLoading to false on completion or error.
        try {
            const summaries = await loadConversations();
            set({ conversationSummaries: summaries, isLoading: false });
            return summaries;
        } catch (error) {
            console.error("Failed to fetch conversation summaries:", error);
            set({ conversationSummaries: [], isLoading: false });
            return [];
        }
    },

    // Initial store setup logic
    initStore: async () => {
        if (get().isStoreInitialized) {
            // console.log("Store already initialized.");
            if (get().isLoading) set({isLoading: false});
            return;
        }
        set({ isStoreInitialized: true, isLoading: true }); // Set flag and initial loading

        const summaries = await get().fetchConversationSummaries(); // fetchConversationSummaries will set isLoading to false

        // Check currentChatId *after* fetching summaries
        const currentId = get().currentChatId;

        if (currentId === null && summaries.length === 0) {
            console.log("initStore: No current chat and no summaries. Creating a new chat.");
            // This call to createNewChat is acceptable if it's truly a fresh start.
            // createNewChat itself calls fetchConversationSummaries.
            await get().createNewChat(); // createNewChat also handles isLoading
        } else if (currentId === null && summaries.length > 0) {
            console.log("initStore: Chats exist, but no current chat selected. User should select a chat or create new.");
            // Ensure isLoading is false if we don't do anything else async here
            set({ isLoading: false });
        } else {
            // If currentId is already set, or other conditions, ensure isLoading is false.
            // This handles cases where summaries might exist and currentId is already set.
            set({ isLoading: false });
        }
        // If currentChatId is already set (e.g. from a previous session restore if you implement that),
        // you might want to ensure its history is loaded here or rely on user action.
    }
}));

// Call initStore after the store is created.
// Zustand's `create` function runs synchronously, so `assistantPageStore` is defined.
// We need to access methods on the store, so we do it after `create`.
const useStore = assistantPageStore; // Standard way to get the hook
// const storeApi = useStore.getState(); // Get the store API (getState, setState, subscribe) // Not needed if initStore is not called here

// Initialize the store after it's fully created
// storeApi.initStore().catch(console.error); // REMOVE THIS LINE
