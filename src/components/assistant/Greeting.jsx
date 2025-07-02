import logo from "../../assets/logo.svg"
import { assistantPageStore } from "./assistantPageStore"
import { store } from "../../store/store"
import { useEffect, useRef } from "react"

export function Greeting() {
    const {isChatStarting} = assistantPageStore();
    const logoRef = useRef();
    const greetingMessageRef = useRef();
    const greetingContainerRef = useRef();
    const {nickname} = store();

    useEffect(()=>{
        if(greetingContainerRef.current && logoRef.current && isChatStarting){
            logoRef.current.style.width = "20px"
            logoRef.current.style.height = "20px"
            greetingContainerRef.current.style.top = "0"
            greetingContainerRef.current.style.flexDirection = "row"
            greetingContainerRef.current.style.alignItems = "center"
            greetingContainerRef.current.style.justifyContent = "start";
            greetingMessageRef.current.style.fontSize = "12px"
            greetingMessageRef.current.innerText = `What can I help you with?`
        }
    },[isChatStarting])
    
    return (
        <div ref={greetingContainerRef} className="absolute top-10 left-1/2 transform -translate-x-1/2 w-[90%] flex flex-col items-center justify-center transition-all duration-500 ease-in-out">
            <img ref={logoRef} src={logo} className="w-14 h-14 transition-all duration-500 ease-in-out" />
            <p ref={greetingMessageRef} className="text-xl font-bold transition-all duration-500 ease-in-out">
                {nickname ? (
                    <>
                        Hello {Array.from(nickname).map((char, index) => (
                            <span
                                key={index}
                                className='bounce-char font-bold'
                                style={{ animationDelay: `${index * 0.1}s` }}>
                                {char}
                            </span>
                        ))}
                    </>
                ) : (
                    "Hello there!"
                )}
            </p>
        </div>
    )
}