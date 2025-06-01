import {create} from "zustand";
import {setState} from "../../store/store.js";
// Removed IndexedDB utility imports:
// import {
//     initDB,
//     saveConversation,
//     loadConversations,
//     loadConversationHistory,
//     generateChatId
// } from "../../lib/lib.js";

// Removed top-level initDB() call:
// initDB().then(() => {
//     console.log("Database initialized");
// }).catch(console.error);

export const assistantPageStore = create((set,get) => ({
    // Removed IndexedDB-related states:
    // isStoreInitialized: false,
    // currentChatId: null,
    // conversationSummaries: [],

    isChatStarting: false,
    setIsChatStarting: (arg) => setState(set,get,"isChatStarting",arg),
    chatHistory: [],
    // Simplified setChatHistory
    setChatHistory: (newMessage) => set(state => ({
        chatHistory: [...state.chatHistory, newMessage]
    })),
    message: "",
    setMessage: (arg) => setState(set,get,"message",arg),
    isLoading: false,
    setIsLoading: (arg) => setState(set,get,"isLoading",arg),

    // Removed IndexedDB-related actions:
    // createNewChat: async () => { ... },
    // switchConversation: async (chatId) => { ... },
    // fetchConversationSummaries: async () => { ... },

    // Simplified initStore (if still needed by components)
    initStore: async () => {
        // console.log("Store init: No DB operations.");
        set({ isLoading: false });
    },
}));

// Removed module-level initStore call (already done in previous steps, but verified)
// const useStore = assistantPageStore;
// const storeApi = useStore.getState();
// storeApi.initStore().catch(console.error);
