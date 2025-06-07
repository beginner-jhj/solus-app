import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChatResponse } from "./ChatResponse.jsx";
import { schedulePageStore, monthNames } from "./schedulePageStore.js";
import { checkAuth } from "../../lib/lib.js";
import logo from "../../assets/logo.svg";
import { Loading } from "../Loading.jsx";

export function ActionPopup() {
  const navigate = useNavigate();
  const {
    showActionPopup,
    setShowActionPopup,
    actionPopupPos,
    setActionPopupPos,
    selectedDays,
    firstChatAction,
  } = schedulePageStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startDay, setStartDay] = useState(null);
  const [endDay, setEndDay] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - actionPopupPos.left,
      y: e.clientY - actionPopupPos.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newLeft = e.clientX - dragOffset.x;
    const newTop = e.clientY - dragOffset.y;

    setActionPopupPos({ top: newTop, left: newLeft });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (selectedDays.length > 0) {
      const sortedSelectedDays = [...selectedDays].sort(
        (a, b) => a.day - b.day
      );
      const firstDay = sortedSelectedDays[0];
      const lastDay = sortedSelectedDays[sortedSelectedDays.length - 1];
      setStartDay({ day: firstDay.day, month: firstDay.month });
      setEndDay({ day: lastDay.day, month: lastDay.month });
    }
  }, [selectedDays]);

  const getFirstActionResponse = async (firstChatAction) => {
    try {
      setLoading(true);
      const accessToken = await checkAuth(navigate);
      const userPreferedLanguage = navigator.language;

      const processedDays = [...selectedDays]
        .sort((a, b) => a.day - b.day)
        .map(({ day, month }) => ({
          day,
          month: monthNames[month],
        }));

      let message = "";

      if (firstChatAction === "recommend") {
        message = `
Recommend new schedules for me based on the following selected days.
Respond in ${userPreferedLanguage}.

## Selected Days:
${JSON.stringify(processedDays, null, 2)}

## My Current Events for These Days:
[Currently empty because no events provided — You can suggest based on free time slots or typical patterns.]
  `.trim();
      } else if (firstChatAction === "report") {
        message = `
Please provide a clear and structured report of my schedules for the following selected days.
Respond in ${userPreferedLanguage}.

## Selected Days:
${JSON.stringify(processedDays, null, 2)}
  `.trim();
      }

      const response = await fetch("http://localhost:8000/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message,
        }),
      });
      const jsonRes = await response.json();
      setChatHistory([{ role: "assistant", ...jsonRes.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getResponse = async (message) => {
    try {
      setLoading(true);
      const accessToken = await checkAuth(navigate);

      const processedDays = [...selectedDays]
        .sort((a, b) => a.day - b.day)
        .map(({ day, month }) => ({
          day,
          month: monthNames[month],
        }));

      message += `\n\nSelected Days: ${JSON.stringify(processedDays)}`;

      const response = await fetch("http://localhost:8000/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message,
        }),
      });
      const jsonRes = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", ...jsonRes.response },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firstChatAction && selectedDays.length > 0) {
      setChatHistory([]);
      setMessage("");
      getFirstActionResponse(firstChatAction);
    }
  }, [firstChatAction, selectedDays]);

  // --- Chat scroll logic ---
  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  // ------------------------

  return (
    <div
      style={{ top: actionPopupPos?.top, left: actionPopupPos?.left }}
      className={`absolute z-10 w-[300px] h-[350px] bg-white rounded-md shadow-md ${
        showActionPopup ? "flex" : "hidden"
      } p-2 flex-col items-center justify-start`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <img src={logo} className="w-7 h-7"></img>
          <div className="flex items-center gap-x-1 mb-1">
            <span className="font-semibold text-lg">{startDay?.month}</span>
            <span className="font-semibold text-lg">
              {startDay?.day} - {endDay?.day}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowActionPopup(false)}
          className="cursor-pointer border border-gray-300 rounded-md p-1 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
        >
          Close
        </button>
      </div>
      <div
        ref={chatContainerRef}
        className="w-full h-full flex flex-col items-start justify-start gap-y-2 overflow-y-auto pb-[60px]"
      >
        {chatHistory.map((chatInfo, index) => (
          <ChatResponse key={index} chatInfo={chatInfo} />
        ))}
        {loading && <Loading style={{ marginTop: "10px" }} />}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              return;
            }
            e.preventDefault();
            if (message.trim().length > 0) {
              setChatHistory((prev) => [
                ...prev,
                { role: "user", response: message },
              ]);
              setMessage("");
              getResponse(message);
            }
          }
        }}
        className="absolute bottom-0 bg-white w-[95%] h-[50px] rounded-md shadow-lg focus:outline-none p-3"
        placeholder="Enter your message"
      ></textarea>
    </div>
  );
}
