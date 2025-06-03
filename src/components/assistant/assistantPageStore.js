import {create} from "zustand";
import {setState} from "../../store/store.js";
import { openIndexedDB, getDataFromIndexedDB } from "../../lib/lib.js";

export const assistantPageStore = create((set,get) => ({
    isStoreInitialized: false,
    currentConversationId: null,
    conversations: [], // List of conversations with their summaries
    showConversationList: false, // Control visibility of conversation list
    
    isChatStarting: false,
    setIsChatStarting: (arg) => setState(set,get,"isChatStarting",arg),
    chatHistory: [],

    setChatHistory: (newMessage) => set(state => ({
        chatHistory: [...state.chatHistory, newMessage]
    })),
    
    // Clear chat history (for new conversations)
    clearChatHistory: () => set({ chatHistory: [] }),
    
    // Set the entire chat history (for switching conversations)
    setFullChatHistory: (history) => set({ chatHistory: history }),
    
    // Toggle conversation list visibility
    toggleConversationList: () => set(state => ({ 
        showConversationList: !state.showConversationList 
    })),
    
    // Set available conversations
    setConversations: (conversations) => set({ conversations }),
    
    // Set current conversation ID
    setCurrentConversationId: (id) => set({ currentConversationId: id }),
    
    // Load conversations from IndexedDB
    loadConversations: async () => {
        try {
            const db = await openIndexedDB("chat", 1);
            const messages = await getDataFromIndexedDB(db, "messages");
            
            // Group messages by conversationId
            const conversationMap = {};
            messages.forEach(msg => {
                if (!conversationMap[msg.conversationId]) {
                    conversationMap[msg.conversationId] = [];
                }
                conversationMap[msg.conversationId].push(msg);
            });
            
            // Create conversation summaries
            const conversations = Object.keys(conversationMap).map(id => {
                const messages = conversationMap[id].sort((a, b) => 
                    new Date(a.timestamp) - new Date(b.timestamp)
                );
                
                // Find the last assistant message with a summary
                const lastAssistantMessage = messages
                    .filter(msg => msg.type === "assistant" && msg.data?.summary)
                    .pop();
                
                return {
                    id,
                    title: lastAssistantMessage?.data?.summary || "New Conversation",
                    timestamp: messages[messages.length - 1]?.timestamp || new Date().toISOString(),
                    messageCount: messages.length
                };
            }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent
            
            set({ 
                conversations,
                isStoreInitialized: true 
            });
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
    },
    
    // Switch to a conversation
    switchConversation: async (conversationId) => {
        try {
            const db = await openIndexedDB("chat", 1);
            const messages = await getDataFromIndexedDB(db, "messages");
            
            // Filter messages for the selected conversation
            const conversationMessages = messages
                .filter(msg => msg.conversationId === conversationId)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            set({ 
                chatHistory: conversationMessages,
                currentConversationId: conversationId,
                showConversationList: false // Hide the list after selection
            });
        } catch (error) {
            console.error("Error switching conversation:", error);
        }
    },
    
    // Create a new conversation
    createNewConversation: () => {
        const newConversationId = `conv_${Date.now()}`;
        set({
            chatHistory: [],
            currentConversationId: newConversationId,
            showConversationList: false
        });
        return newConversationId;
    },
    
    // Delete a conversation
    deleteConversation: async (conversationId) => {
        try {
            const db = await openIndexedDB("chat", 1);
            const messages = await getDataFromIndexedDB(db, "messages");
            
            // Find all messages for this conversation
            const messagesToDelete = messages.filter(msg => msg.conversationId === conversationId);
            
            // Delete each message from IndexedDB
            for (const msg of messagesToDelete) {
                const transaction = db.transaction(["messages"], "readwrite");
                const store = transaction.objectStore("messages");
                await store.delete(msg.id);
            }
            
            // Reload conversations after deletion
            const { loadConversations, currentConversationId, createNewConversation } = get();
            await loadConversations();
            
            // If the deleted conversation was the current one, create a new conversation
            if (currentConversationId === conversationId) {
                createNewConversation();
            }
            
            return true;
        } catch (error) {
            console.error("Error deleting conversation:", error);
            return false;
        }
    },
    message: "",
    setMessage: (arg) => setState(set,get,"message",arg),
    isLoading: false,
    setIsLoading: (arg) => setState(set,get,"isLoading",arg),


    // Removed IndexedDB-related actions:
    // createNewChat: async () => { ... },
    // switchConversation: async (chatId) => { ... },
    // fetchConversationSummaries: async () => { ... },

    // Simplified initStore (if still needed by components)

}));

// Removed module-level initStore call (already done in previous steps, but verified)
// const useStore = assistantPageStore;
// const storeApi = useStore.getState();
// storeApi.initStore().catch(console.error);
