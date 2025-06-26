import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendedEvent } from '../../schedule/ChatResponse';
import { checkAuth } from '../../../lib/lib.js';
import ErrorNotification from '../../common/ErrorNotification.jsx';
import { openIndexedDB, getDataByKeyFromIndexedDB, updateDataToIndexedDB } from '../../../lib/lib.js';
import logo from '../../../assets/logo.svg';


export function AssistantMessage({ message }) {
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const navigate = useNavigate();
  const assistantHtmlResponseContainerRef = useRef();
  const [openErrorNotification, setOpenErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error occurred while accepting the event. Please try again.");

  useEffect(() => {
    if (message.data && message.data.response && message.data.suggestedSchedules && message.data.suggestedSchedules.length > 0) {
      // Ensure each recommendation has a unique ID if not provided by backend
      setCurrentRecommendations(
        message.data.suggestedSchedules.map((rec) => ({
          ...rec
        }))
      );
    } else {
      setCurrentRecommendations([]); // Clear recommendations if not present
    }
  }, [message.data?.suggestedSchedules]);


  let responseToRender = "Assistant is processing..."; // Default fallback

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
      if (response.ok) {
        setCurrentRecommendations((prev) => prev.filter((rec) => rec.id !== recommendation.id));
        const chatId = message.id;
        const database = await openIndexedDB("chat", 1);
        const currentChat = await getDataByKeyFromIndexedDB(database, "messages", chatId);
        const updatedChat = {
          ...currentChat,
          data: {
            ...currentChat.data,
            suggestedSchedules: currentChat.data.suggestedSchedules.filter((rec) => rec.id !== recommendation.id)
          }
        };
        await updateDataToIndexedDB(database, "messages", updatedChat.id, updatedChat);

      } else {
        console.error("Failed to accept event:", response.status, await response.text());
        setOpenErrorNotification(true);
      }
    } catch (err) {
      console.error("Error accepting event:", err);
      setOpenErrorNotification(true);
    }
  };

  const handleAcceptAll = async () => {
    try {
      for (const recommendation of currentRecommendations) {
        await handleAccept(recommendation); // Sequentially accept
      }
    } catch (err) {
      console.error("Error in handleAcceptAll:", err);
      setOpenErrorNotification(true);
    }
  };

  if (message.data && message.data.response) {
    // Direct access to the response field from simplified data
    responseToRender = message.data.response;
  } else if (message.data && message.data.error) {
    responseToRender = message.data.error.message || "An error occurred";
  } else if (message.data) {
    // If there's data but not in the expected structure
    console.error("AssistantMessage: Unexpected message.data structure:", message.data);
    responseToRender = "Received an unexpected response structure. Please check console for details.";
  }
  // Note: if message.data.error exists, that path is handled by the JSX conditional rendering below.
  // If message.data is null/undefined, responseToRender remains "Assistant is processing...".

  // Determine if the final responseToRender string contains HTML
  const useHTML = typeof responseToRender === 'string' && /[<>]/g.test(responseToRender);

  useEffect(() => {
    const handleClick = async (e) => {
      const target = e.target;
      if (target.tagName === 'A') {
        e.preventDefault();
        const url = target.getAttribute('href');

        setErrorMessage("If you click on this link, this popup will close in 3 seconds.");
        setOpenErrorNotification(true);

        setTimeout(async()=>{
          await chrome.runtime.sendMessage({ type: "OPEN_URL", url });
        },3000)
      }
    };

    const container = assistantHtmlResponseContainerRef.current;
    container?.addEventListener('click', handleClick);

    return () => {
      container?.removeEventListener('click', handleClick);
    };
  }, [assistantHtmlResponseContainerRef,responseToRender]);

  return (
    <div className="my-2 flex justify-start">
      <ErrorNotification
        open={openErrorNotification}
        message={errorMessage}
        onClose={() => setOpenErrorNotification(false)}
        severity="error"
        duration={5000}
      />
      <div className="flex flex-col items-start">
        <div className="flex items-center mb-1">
          <img src={logo} className="w-5 h-5 rounded-full border" alt="Assistant" />
        </div>
        {message.data && message.data.error ? (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl shadow-md max-w-md lg:max-w-lg break-words">
            <p className="font-bold mb-1">Assistant Error</p>
            <p>{message.data.error.message || "An unexpected error occurred"}</p>
          </div>
        ) : (
          // Normal response rendering path
          <div className="bg-slate-100 text-slate-800 py-2 px-4 rounded-xl shadow-md max-w-md lg:max-w-lg prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none break-words">
            {useHTML ? (
              <div ref={assistantHtmlResponseContainerRef} dangerouslySetInnerHTML={{ __html: responseToRender }} />
            ) : (
              responseToRender
            )}
            {currentRecommendations && currentRecommendations.length > 0 && (
              <div className="w-full flex flex-col items-start mt-2">
                <div className="flex w-full items-center justify-between px-1 mb-1">
                  <span className="font-semibold text-xs text-blue-700">Suggested Events</span>
                  {currentRecommendations.length > 0 && (
                    <button
                      className="text-xs text-blue-700 font-semibold cursor-pointer"
                      onClick={handleAcceptAll}
                    >
                      Accept All
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  {currentRecommendations.map((recommendation) => (
                    <RecommendedEvent
                      key={recommendation.id}
                      recommendation={recommendation}
                      handleAccept={handleAccept}
                      currentRecommendations={currentRecommendations}
                      setCurrentRecommendations={setCurrentRecommendations}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
