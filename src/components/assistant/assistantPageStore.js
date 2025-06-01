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
    // Track if we're currently in the process of updating summaries to prevent loops
    _isFetchingSummaries: false,
    
    setChatHistory: (newMessage) => {
      // --- Synchronous Part ---
      const oldState = get(); // Get current state for decision making
      let determinedChatId = oldState.currentChatId;
      let determinedSummary = "";
      let isNewChatIdBeingSet = false;
      let summaryActuallyChanged = false;

      // Prevent calling during render phase
      if (typeof window !== "undefined" && 
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderPhase) {
        console.error("setChatHistory called during render phase! This will cause infinite loops.");
        return; // Exit early to prevent loops
      }

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
      }

      // BATCH UPDATE: Do all synchronous state updates at once to prevent multiple renders
      set(state => ({
        chatHistory: [...state.chatHistory, newMessage],
        currentChatId: determinedChatId // Update currentChatId if it was newly generated
      }));

      // --- Asynchronous Part ---
      // Use an immediately invoked async function (IIFE) with debounce logic
      (async () => {
        try {
          const newState = get(); // Get the absolute latest state after the set operation
          
          // Save conversation first (this doesn't affect UI state)
          await saveConversation({
            id: newState.currentChatId,
            summary: determinedSummary,
            history: newState.chatHistory
          });

          // Only fetch summaries if needed AND we're not already fetching
          if ((isNewChatIdBeingSet || summaryActuallyChanged) && !get()._isFetchingSummaries) {
            // Set flag to prevent concurrent fetches
            set({ _isFetchingSummaries: true });
            
            // Add a small delay to debounce multiple rapid calls
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Only proceed if we're still the most recent call
            if (get()._isFetchingSummaries) {
              await newState.fetchConversationSummaries();
              // Reset flag when done
              set({ _isFetchingSummaries: false });
            }
          }
        } catch (error) {
          console.error("Error in setChatHistory async operations:", error);
          // Always reset flag on error
          set({ _isFetchingSummaries: false });
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

    // Flag to track if we're currently creating a new chat to prevent loops
    _isCreatingNewChat: false,
    
    createNewChat: async () => {
        // Prevent calling during render phase
        if (typeof window !== "undefined" && 
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderPhase) {
          console.error("createNewChat called during render phase! This will cause infinite loops.");
          return; // Exit early to prevent loops
        }
        
        // Prevent concurrent calls
        if (get()._isCreatingNewChat) {
            console.log("Already creating a new chat, ignoring duplicate call");
            return;
        }
        
        set({ _isCreatingNewChat: true });
        const newId = generateChatId();
        
        // Batch all UI state updates together
        set({ 
            currentChatId: newId, 
            chatHistory: [], 
            message: "", 
            isChatStarting: true 
        });
        
        try {
            // Save a placeholder conversation
            await saveConversation({ id: newId, summary: "New Chat", history: [] });
            // Refresh the list of conversation summaries
            await get().fetchConversationSummaries();
        } catch (error) {
            console.error("Failed to create and save new chat:", error);
        } finally {
            // Always reset the flag when done
            set({ _isCreatingNewChat: false });
        }
    },

    // Flag to track if we're currently switching conversations to prevent loops
    _isSwitchingConversation: false,
    
    switchConversation: async (chatId) => {
        // Prevent calling during render phase
        if (typeof window !== "undefined" && 
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderPhase) {
          console.error("switchConversation called during render phase! This will cause infinite loops.");
          return; // Exit early to prevent loops
        }
        
        if (!chatId) {
            console.error("switchConversation called with invalid chatId:", chatId);
            set({ isLoading: false }); // Ensure loading is stopped
            return;
        }

        if (get().currentChatId === chatId) {
            return; // Already on this conversation
        }
        
        // Prevent concurrent calls
        if (get()._isSwitchingConversation) {
            console.log("Already switching conversation, ignoring duplicate call");
            return;
        }
        
        set({ _isSwitchingConversation: true, isLoading: true });
        
        try {
            const history = await loadConversationHistory(chatId);
            
            // Batch all UI state updates together
            set({
                currentChatId: chatId,
                chatHistory: history || [],
                message: "",
                isChatStarting: (history || []).length === 0,
                isLoading: false,
                _isSwitchingConversation: false // Reset flag when done
            });
        } catch (error) {
            console.error("Failed to switch conversation:", error);
            // Reset all flags on error
            set({ 
                isLoading: false,
                _isSwitchingConversation: false 
            });
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

    // Flag to track if we're currently initializing the store to prevent loops
    _isInitializingStore: false,
    
    // Initial store setup logic
    initStore: async () => {
        console.log("initStore called", new Date().toISOString());
        
        // If already initialized, exit early
        if (get().isStoreInitialized) {
            console.log("Store already initialized, skipping initialization");
            if (get().isLoading) set({isLoading: false});
            return;
        }
        
        // Prevent concurrent initialization
        if (get()._isInitializingStore) {
            console.log("Store initialization already in progress, skipping duplicate call");
            return;
        }
        
        // Set all initialization flags at once
        set({ 
            isStoreInitialized: true, 
            isLoading: true,
            _isInitializingStore: true 
        });
        
        try {
            const summaries = await get().fetchConversationSummaries();
            
            // Check currentChatId after fetching summaries
            const currentId = get().currentChatId;
            
            if (currentId === null && summaries.length === 0) {
                console.log("initStore: No current chat and no summaries. Creating a new chat.");
                await get().createNewChat();
            } else if (currentId === null && summaries.length > 0) {
                console.log("initStore: Chats exist, but no current chat selected.");
                set({ isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error("Error during store initialization:", error);
            set({ isLoading: false });
        } finally {
            // Always reset initialization flag when done
            set({ _isInitializingStore: false });
        }
    }
}));

// Call initStore after the store is created.
// Zustand's `create` function runs synchronously, so `assistantPageStore` is defined.
// We need to access methods on the store, so we do it after `create`.
const useStore = assistantPageStore; // Standard way to get the hook
// const storeApi = useStore.getState(); // Get the store API (getState, setState, subscribe) // Not needed if initStore is not called here

// Initialize the store after it's fully created
// storeApi.initStore().catch(console.error); // REMOVE THIS LINE
