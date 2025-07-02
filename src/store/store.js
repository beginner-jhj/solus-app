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

export const eventCategoryStyles = {
    Work:{
        border:"border-blue-400",
        bg:"bg-blue-400",
        label:"bg-blue-100 text-blue-700 border-blue-400"
    },
    Study:{
        border:"border-green-400",
        bg:"bg-green-400",
        label:"bg-green-100 text-green-700 border-green-400"
    },
    Personal:{
        border:"border-yellow-400",
        bg:"bg-yellow-400",
        label:"bg-yellow-100 text-yellow-700 border-yellow-400"
    },
    Exercise:{
        border:"border-red-400",
        bg:"bg-red-400",
        label:"bg-red-100 text-red-700 border-red-400"
    }
};

export const store = create((set,get)=>({
    profileImageURL:"",
    setProfileImageURL:(arg)=>setState(set,get,"profileImageURL",arg),
    nickname:"",
    setNickname:(arg)=>setState(set,get,"nickname",arg),
}))