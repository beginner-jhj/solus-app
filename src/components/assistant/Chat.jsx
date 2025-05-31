import { assistantPageStore } from "./assistantPageStore"
import { useEffect, useRef } from "react"
import {useNavigate} from "react-router-dom"
import { checkAuth,getLocation } from "../../lib/lib"

export function Chat(){
    const {setIsChatStarting, isChatStarting, message, setMessage} = assistantPageStore();
    const chatRef = useRef();
    const navigate = useNavigate();

    useEffect(()=>{
        if(chatRef.current && isChatStarting){
            chatRef.current.style.bottom = "5px"
        }
    },[isChatStarting])

    const handleSend = async (message) => {
        if(message !== ""){
            const accessToken = await checkAuth(navigate);
            const location = await getLocation();
            const response = await fetch("http://localhost:8000/assistant/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ message,location }),
            });
            const data = await response.json();
            console.log(data);
            setMessage("");
        }
    }
    

    return (
        <textarea value={message} ref={chatRef} onClick={() => setIsChatStarting(true)} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) =>{
            if(e.key === "Enter" && !e.shiftKey){
                e.preventDefault();
                handleSend(message);
            }
        }} placeholder="Ask me anything..." className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] h-16 text-gray-500 font-semibold focus:outline-none rounded-md shadow-md bg-white p-3 transition-all duration-500 ease-in-out"></textarea>
    )
}