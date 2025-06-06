import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendedEvent } from '../../schedule/ChatResponse'; // Assuming ChatResponse.jsx is in this path
import { checkAuth } from '../../../lib/lib.js'; // Adjusted path


export function AssistantMessage({ message }) {
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("message:", message);
    if (message.data && message.data.response && message.data.suggestedSchedules && message.data.suggestedSchedules.length > 0) {
      // Ensure each recommendation has a unique ID if not provided by backend
      setCurrentRecommendations(
        message.data.suggestedSchedules.map((rec, index) => ({
          ...rec,
          id: rec.id || `event-${Date.now()}-${index}`, // Add a simple unique ID
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
      } else {
        console.error("Failed to accept event:", response.status, await response.text());
        // Optionally, display an error to the user
      }
    } catch (err) {
      console.error("Error accepting event:", err);
      // Optionally, display an error to the user
    }
  };

  const handleAcceptAll = async () => {
    try {
      for (const recommendation of currentRecommendations) {
        await handleAccept(recommendation); // Sequentially accept
      }
    } catch (err) {
      console.error("Error in handleAcceptAll:", err);
      // Optionally, display an error to the user
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

  const determinedFormatType = message.data?.determinedFormatType;

  return (
    <div className="my-2 flex justify-start">
      {/* Error display logic */}
      {message.data && message.data.error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl shadow-md max-w-md lg:max-w-lg break-words">
          <p className="font-bold mb-1">Assistant Error</p>
          <p>{message.data.error.message || "An unexpected error occurred"}</p>
        </div>
      ) : (
        // Normal response rendering path
        <div className="bg-slate-100 text-slate-800 py-2 px-4 rounded-xl shadow-md max-w-md lg:max-w-lg prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none break-words">
          {useHTML ? (
            <div dangerouslySetInnerHTML={{ __html: responseToRender }} />
          ) : (
            responseToRender
          )}
          {determinedFormatType === "schedule_recommendation_list" && currentRecommendations && currentRecommendations.length > 0 && (
            <div className="w-full flex flex-col items-start mt-2">
              <div className="flex w-full items-center justify-between px-1 mb-1">
                <span className="font-semibold text-xs text-blue-700">
                  Suggested Events
                </span>
                {currentRecommendations.length > 0 && ( // Only show Accept All if there are recommendations
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
                    handleAccept={handleAccept} // Pass the new handleAccept
                    currentRecommendations={currentRecommendations}
                    setCurrentRecommendations={setCurrentRecommendations} // For handleDelete within RecommendedEvent
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
