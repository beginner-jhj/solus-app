import { store } from "../../store/store.js";
import logo from "../../assets/logo.svg";
import acceptIconGray from "../../assets/complete.svg";
import acceptIconColored from "../../assets/complete-colored.svg";
import declineIcon from "../../assets/delete.svg";
import { useEffect, useRef, useState } from "react";
import { checkAuth } from "../../lib/lib.js";
import { useNavigate } from "react-router-dom";

export function ChatResponse({ chatInfo}) {
  const { role, response, suggestedSchedules } = chatInfo;
  const useHTML = typeof response === 'string' && /[<>]/g.test(response);
  const { profileImageURL } = store();
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const isAssistant = role === "assistant";
  const navigate = useNavigate();

  useEffect(()=>{
    if(suggestedSchedules.length>0){
      setCurrentRecommendations(()=>suggestedSchedules.map((recommendation,index)=>({...recommendation,id:`event-${index}`})));
    }
  },[suggestedSchedules])

  const handleAccept = async (recommendation) => {
    try {
      const accessToken = await checkAuth(navigate);
      const response = await fetch("http://localhost:8000/schedule/add_event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: recommendation.title,
          description: recommendation.description,
          startTime: recommendation.suggestedStartTime,
          endTime: recommendation.suggestedEndTime,
          eventCategory: recommendation.suggestedEventCategory,
          year: new Date().getFullYear(),
          month: Number(recommendation.suggestedDate.split("-")[1]),
          day: Number(recommendation.suggestedDate.split("-")[2]),
        }),
      });
      if(response.ok){
        setCurrentRecommendations((prev)=>prev.filter((rec)=>rec.id!==recommendation.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAll = async ()=>{
    try{
      for(const recommendation of currentRecommendations){
        await handleAccept(recommendation);
      }
    }catch(err){
      console.error(err)
    }
  }

  return (<div
      className={`w-[90%] flex flex-col items-start justify-start rounded-md gap-y-2 mb-2 ${
        isAssistant ? "bg-blue-50" : "bg-gray-50"
      } p-2 border border-gray-200 shadow-sm`}
    >
      <div className="flex items-center gap-x-2 mb-1">
        <img
          src={isAssistant ? logo : profileImageURL}
          className="w-5 h-5 rounded-full border"
          alt={isAssistant ? "Assistant" : "User"}
        />
        <span className="font-semibold text-sm">
          {isAssistant ? "Solus Assistant" : localStorage.getItem("nickname")}
        </span>
      </div>
      {useHTML ? (
        <div dangerouslySetInnerHTML={{ __html: response }} />
      ) : (
        <div className="w-full text-sm text-gray-800 whitespace-pre-line mb-1">
          {response}
        </div>
      )}
      {suggestedSchedules.length > 0 && (
        <div className="w-full flex flex-col items-start mt-2">
          <div className="flex w-full items-center justify-between px-1 mb-1">
            <span className="font-semibold text-xs text-blue-700">
              Suggested Events
            </span>
            <button className="text-xs text-blue-700 font-semibold cursor-pointer" onClick={handleAcceptAll}>
              Accept All
            </button>
          </div>
          <div className="flex flex-col gap-y-2 w-full">
            {currentRecommendations.map((recommendation, index) => (
              <RecommendedEvent key={index} recommendation={recommendation} handleAccept={handleAccept} currentRecommendations={currentRecommendations} setCurrentRecommendations={setCurrentRecommendations}/>
            ))}
          </div>
        </div>
      )}
    </div>)
}

export function RecommendedEvent({ recommendation, handleAccept, currentRecommendations, setCurrentRecommendations }) {
  const [isHover, setIsHover] = useState(false);
  const acceptRef = useRef(null);

  useEffect(() => {
    if (acceptRef.current) {
      acceptRef.current.src = isHover ? acceptIconColored : acceptIconGray;
    }
  }, [isHover]);

  const handleDelete = (recommendation) => {
    setCurrentRecommendations((prev)=>prev.filter((rec)=>rec.id!==recommendation.id));
  }

  return (
    <div className="w-full rounded-lg border border-blue-200 bg-white p-2 shadow-sm flex flex-col gap-y-1">
      <div className="flex items-center gap-x-2 mb-1">
        <span className="font-bold text-sm text-blue-800">
          {recommendation.title}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {recommendation.suggestedEventCategory}
        </span>
      </div>
      <div className="flex items-center gap-x-2 text-xs text-gray-500 mb-1">
        <span>
          {recommendation.suggestedDate} ({recommendation.suggestedStartTime} -{" "}
          {recommendation.suggestedEndTime})
        </span>
      </div>
      <div className="text-xs text-gray-700 whitespace-pre-line">
        {recommendation.description}
      </div>
      <div className="w-full flex items-center justify-end gap-x-1">
        <img
          ref={acceptRef}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={()=>handleAccept(recommendation,currentRecommendations)}
          src={acceptIconGray}
          alt="accept"
          className="w-4 h-4 cursor-pointer hover:scale-110 transition-all"
        />
        <img
          src={declineIcon}
          onClick={()=>handleDelete(recommendation)}
          alt="decline"
          className="w-4 h-4 cursor-pointer hover:scale-110 transition-all"
        />
      </div>
    </div>
  );
}
