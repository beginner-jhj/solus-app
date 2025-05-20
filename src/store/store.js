import {create} from "zustand";

export const setState = (set,get,stateName,arg)=>{
    if(typeof arg === "function"){
        const prevValue = get()[stateName];
        const newValue = arg(prevValue);
        set({ [stateName]: newValue });
    } else {
        set({ [stateName]: arg });
    }
}

export const store = create((set,get)=>({
    profileImageURL:"",
    setProfileImageURL:(arg)=>setState(set,get,"profileImageURL",arg),  
}))