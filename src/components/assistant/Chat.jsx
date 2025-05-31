import { assistantPageStore } from "./assistantPageStore"
import { useEffect, useRef } from "react"
import {useNavigate} from "react-router-dom"
import { checkAuth,getLocation } from "../../lib/lib"

export function Chat(){
    const {setIsChatStarting, isChatStarting, message, setMessage, setChatHistory, setIsLoading} = assistantPageStore();
    const chatRef = useRef(); // Keep ref if needed for other purposes, but not for style.bottom
    const navigate = useNavigate();

    // useEffect for style.bottom is removed as it's not needed with new layout

    const handleSend = async (messageContent) => {
        if(messageContent.trim() === ""){
            return;
        }

        const userMessage = { type: "user", text: messageContent };
        setChatHistory(userMessage);
        setMessage(""); // Clear input immediately after sending user message to history

        setIsLoading(true);
        try {
            const accessToken = await checkAuth(navigate);
            const location = await getLocation();
            const likes = localStorage.getItem("likes") || "";
            const dislikes = localStorage.getItem("dislikes") || "";
            const userProfileInfo = { likes, dislikes };

            const response = await fetch("http://localhost:8000/assistant/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ message: messageContent, location, userProfileInfo }),
            });

            if (!response.ok) {
                // Handle HTTP errors like 4xx, 5xx
                const errorData = await response.json().catch(() => ({ message: "Server error" })); // Try to parse JSON error, fallback
                const assistantErrorMessage = { type: "assistant", data: { error: true, ...errorData } };
                setChatHistory(assistantErrorMessage);
                console.error("Server error:", response.status, errorData);
                // Optionally, do not clear message here, or set a specific error message
                return;
            }

            const data = await response.json();
            const assistantMessage = { type: "assistant", data: data };
            setChatHistory(assistantMessage);

            // Process new_user_preference
            if (data.new_user_preference) {
                if (data.new_user_preference.likes) {
                    localStorage.setItem("likes", data.new_user_preference.likes);
                }
                if (data.new_user_preference.dislikes) {
                    localStorage.setItem("dislikes", data.new_user_preference.dislikes);
                }
            }
            // setMessage(""); // Moved up to clear after user sends their message
        } catch (error) {
            console.error("Failed to send message or process response:", error);
            const assistantErrorMessage = { type: "assistant", data: { error: true, message: error.message || "Network error" } };
            setChatHistory(assistantErrorMessage);
        } finally {
            setIsLoading(false);
        }
    }



    return (
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
    )
}