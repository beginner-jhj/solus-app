import {create} from "zustand";
import {setState} from "../../store/store.js";

export const assistantPageStore = create((set,get) => ({
    isChatStarting: false,
    setIsChatStarting: (arg) => setState(set,get,"isChatStarting",arg),
    chatHistory: [],
    setChatHistory: (arg) => setState(set,get,"chatHistory",arg),
    message: "",
    setMessage: (arg) => setState(set,get,"message",arg),
    isLoading: false,
    setIsLoading: (arg) => setState(set,get,"isLoading",arg),
    
}))
