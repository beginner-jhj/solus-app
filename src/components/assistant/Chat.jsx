import { assistantPageStore } from "./assistantPageStore"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { checkAuth, getLocation, openIndexedDB, addDataToIndexedDB, getDataFromIndexedDB, updateDataToIndexedDB, fetchWithErrorHandling } from "../../lib/lib"
import ErrorNotification from "../common/ErrorNotification"

export function Chat(){
    const {
        setIsChatStarting, 
        message, 
        setMessage, 
        setChatHistory, 
        setIsLoading,
        currentConversationId,
        setCurrentConversationId
    } = assistantPageStore();
    const chatRef = useRef();
    const navigate = useNavigate();
    const [db, setDb] = useState(null);
    const [error, setError] = useState({ open: false, message: "" });


    // Initialize IndexedDB connection
    useEffect(() => {
        const initDb = async () => {
            try {
                const database = await openIndexedDB("chat", 1);
                setDb(database);
                
                // Create a new conversation if none exists
                if (!currentConversationId) {
                    const newConversationId = `conv_${Date.now()}`;
                    setCurrentConversationId(newConversationId);
                }
            } catch (error) {
                console.error("Error initializing database:", error);
            }
        };
        
        initDb();
    }, [currentConversationId, setCurrentConversationId]);

    // Function to save message to IndexedDB
    const saveMessageToDb = async (message) => {
        if (!db || !currentConversationId) return;
        
        try {
            const newChatId = `chat_${Date.now()}`;
            const messageToSave = {
                ...message,
                id: newChatId,
                conversationId: currentConversationId,
                timestamp: new Date().toISOString()
            };
            
            await addDataToIndexedDB(db, "messages", messageToSave);
        } catch (error) {
            console.error("Error saving message to database:", error);
        }
    };
    
    // Function to get conversation history from IndexedDB
    const getConversationHistory = async () => {
        if (!db || !currentConversationId) return [];
        
        try {
            const allMessages = await getDataFromIndexedDB(db, "messages");
            return allMessages
                .filter(msg => msg.conversationId === currentConversationId)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } catch (error) {
            console.error("Error retrieving conversation history:", error);
            return [];
        }
    };

    const handleSend = async (messageContent) => {
        if(messageContent.trim() === ""){
            return;
        }
        const userMessage = { type: "user", data: { message: messageContent } };
        setChatHistory(userMessage);
        setMessage(""); // Clear input immediately after sending user message to history
        
        // Save user message to IndexedDB
        await saveMessageToDb(userMessage);

        setIsLoading(true);
        try {
            const accessToken = await checkAuth(navigate);
            const location = await getLocation();
            const nickname = localStorage.getItem("nicknames") || "";
            const likes = localStorage.getItem("likes") || "";
            const dislikes = localStorage.getItem("dislikes") || "";
            const hobbies = localStorage.getItem("hobbies") || "";
            const personalityTraits = localStorage.getItem("personality_traits") || "";
            const communicationStyle = localStorage.getItem("communication_style") || "";
            const topicsOfInterest = localStorage.getItem("topics_of_interest") || "";
            const userProfileInfo = { likes, dislikes, hobbies, personalityTraits, communicationStyle, topicsOfInterest };
            
            // Get conversation history to send to mainAgent
            const chatHistory = await getConversationHistory();
            
            const data = await fetchWithErrorHandling(
                "http://localhost:8000/assistant/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ 
                        message: messageContent, 
                        location, 
                        nickname,
                        userProfileInfo,
                        chatHistory:chatHistory.slice(-10) // Send the chat history to mainAgent
                    }),
                },
                setError,
                navigate
            );

            let suggestedSchedulesWithIds = data.response.suggestedSchedules?.map((rec, index) => ({
              ...rec,
              id: `event-${Date.now()}-${index}`,
            }));
            
            // Extract only the essential parts from mainAgent's response
            const simplifiedData = {
                response: data.response.response || data.response,
                summary: data.response.summary || "Chat response",
                topic: data.response.metadata.topic,
                tone: data.response.metadata.tone,
                suggestedSchedules: suggestedSchedulesWithIds || []
            };
            
            const assistantMessage = { type: "assistant", data: simplifiedData };
            setChatHistory(assistantMessage);
            
            // Save assistant message to IndexedDB
            await saveMessageToDb(assistantMessage);
            
            // Trigger a reload of conversations to update the list
            const { loadConversations } = assistantPageStore.getState();
            loadConversations();

            // Process new_user_preference
            if (data.new_user_preference) {
                if (data.new_user_preference.likes) {
                    localStorage.setItem("likes", data.new_user_preference.likes);
                }
                if (data.new_user_preference.dislikes) {
                    localStorage.setItem("dislikes", data.new_user_preference.dislikes);
                }
                if (data.new_user_preference.hobbies) {
                    localStorage.setItem("hobbies", data.new_user_preference.hobbies);
                }
                if (data.new_user_preference.personality_traits) {
                    localStorage.setItem("personality_traits", data.new_user_preference.personality_traits);
                }
                if (data.new_user_preference.communication_style) {
                    localStorage.setItem("communication_style", data.new_user_preference.communication_style);
                }
                if (data.new_user_preference.topics_of_interest) {
                    localStorage.setItem("topics_of_interest", data.new_user_preference.topics_of_interest);
                }
            }
        } catch (error) {
            console.error("Failed to send message or process response:", error);
            const assistantErrorMessage = { type: "assistant", data: { error: true, message: error.message || "Network error" } };
            setChatHistory(assistantErrorMessage);
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <>
            <ErrorNotification 
                open={error.open} 
                message={error.message} 
                onClose={() => setError({ ...error, open: false })} 
            />
            <div className="p-3 h-full flex items-center">
                <textarea
                    value={message}
                    ref={chatRef}
                    onClick={() => setIsChatStarting(true)}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) =>{
                        if(e.key === "Enter" && !e.shiftKey){
                            e.preventDefault();
                            handleSend(message);
                        }
                    }}
                    placeholder="Ask me anything..."
                    className="w-full h-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 rounded-xl shadow-sm bg-white text-slate-700 placeholder-slate-400 text-sm"
                />
            </div>
        </>
    )
}