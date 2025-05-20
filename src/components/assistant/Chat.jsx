import { assistantPageStore } from "./assistantPageStore"
import { useEffect, useRef } from "react"

export function Chat(){
    const {setIsChatStarting, isChatStarting} = assistantPageStore();
    const chatRef = useRef();

    useEffect(()=>{
        if(chatRef.current && isChatStarting){
            chatRef.current.style.bottom = "5px"
        }
    },[isChatStarting])

    return (
        <textarea ref={chatRef} onClick={() => setIsChatStarting(true)} placeholder="Ask me anything..." className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] h-16 text-gray-500 font-semibold focus:outline-none rounded-md shadow-md bg-white p-3 transition-all duration-500 ease-in-out"></textarea>
    )
}