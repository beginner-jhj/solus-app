import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SurveyAssistantMessage } from "../components/survey/SurveyAssistantMessage";
import { SurveyUserMessage } from "../components/survey/SurveyUserMessage";
import ErrorNotification from "../components/common/ErrorNotification";
import { checkAuth, fetchWithErrorHandling } from "../lib/lib";

export default function SurveyPage() {
  const navigate = useNavigate();
  const messageEndRef = useRef(null);

  const [surveyHistory, setSurveyHistory] = useState(() => {
    const stored = sessionStorage.getItem("surveyHistory");
    return stored ? JSON.parse(stored) : [];
  });
  const [nextStep, setNextStep] = useState(() =>
    sessionStorage.getItem("nextStep") || "greeting"
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ open: false, message: "" });
  const [isSurveyDone, setIsSurveyDone] = useState(false);

  const storedStructuredAnswer = sessionStorage.getItem("structuredAnswer");

  const surveySteps = [
    "greeting",
    "nickname",
    "likes",
    "location",
    "wakeUpTime",
    "focusTime",
    "routineActivity",
    "personalGoal",
    "finalMessage",
  ];

  useEffect(() => {
    if (surveyHistory.length === 0) {
      fetchSurvey([], nextStep);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [surveyHistory]);

  const fetchSurvey = async (history, step) => {
    try {
      setIsLoading(true);
      const accessToken = await checkAuth(navigate);
      if (!accessToken) return;
      const data = await fetchWithErrorHandling(
        "http://localhost:8000/assistant/survey",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ surveyHistory: history, nextStep: step, structuredAnswerHistory: storedStructuredAnswer }),
        },
        setError,
        navigate
      );
      const { assistantMessage, nextStepId, surveyDone } = data.data || {};

      if (assistantMessage?.text) {
        const assistantMsg = {
          id: `assistant_${Date.now()}`,
          type: "assistant",
          data: {
            response: assistantMessage.text,
            options: assistantMessage.options || [],
          },
        };
        history.push(assistantMsg);
        setSurveyHistory([...history]);
        sessionStorage.setItem("surveyHistory", JSON.stringify(history));
        const {structuredAnswer} = assistantMessage;
        const parsedStructuredAnswer = storedStructuredAnswer
          ? JSON.parse(storedStructuredAnswer)
          : [];
        parsedStructuredAnswer.push(structuredAnswer);
        sessionStorage.setItem("structuredAnswer", JSON.stringify(parsedStructuredAnswer));
      }
      if (nextStepId) {
        setNextStep(nextStepId);
        sessionStorage.setItem("nextStep", nextStepId);
      } else {
        const idx = surveySteps.indexOf(step);
        const next = surveySteps[idx + 1] || "finalMessage";
        setNextStep(next);
        sessionStorage.setItem("nextStep", next);
      }
      if (surveyDone) {
        history.push({
          id: `assistant_${Date.now()}`,
          type: "assistant",
          data: {
            response: "Thank you for your time! You can close this window.",
            options: [],
          },
        });
        setSurveyHistory([...history]);
        localStorage.setItem("didSurvey", true);
        sessionStorage.removeItem("surveyHistory");
        sessionStorage.removeItem("nextStep");
        sessionStorage.removeItem("structuredAnswer");
        setIsSurveyDone(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (message.trim() === "") return;
    const userMsg = {
      id: `user_${Date.now()}`,
      type: "user",
      data: { message },
    };
    const updated = [...surveyHistory, userMsg];
    setSurveyHistory(updated);
    sessionStorage.setItem("surveyHistory", JSON.stringify(updated));
    setMessage("");
    await fetchSurvey(updated, nextStep);
  };

  const finishSurvey = () => {
    navigate("/");
    return;
  };

  return (
    <div className="w-80 h-full flex flex-col bg-slate-50 p-4">
      <ErrorNotification
        open={error.open}
        message={error.message}
        onClose={() => setError({ open: false, message: "" })}
      />
      <div className="flex-1 overflow-y-auto w-full">
        {surveyHistory.map((msg, idx) =>
          msg.type === "user" ? (
            <SurveyUserMessage key={idx} message={msg} />
          ) : (
            <SurveyAssistantMessage key={idx} message={msg} isSurveyDone={isSurveyDone} finishSurveyCallback={finishSurvey} useHtml={typeof msg.data.response === 'string' && /[<>]/g.test(msg.data.response)}/>
          )
        )}
        <div ref={messageEndRef} className="h-1" />
      </div>
      {isLoading && (
        <div className="px-4 py-2 text-center text-xs text-slate-500 animate-pulse">
          I'm thinking...
        </div>
      )}
      <div className="h-[60px] bg-slate-100 border-t border-slate-200">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your answer..."
          className="w-full h-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 shadow-sm bg-white text-slate-700 placeholder-slate-400 text-sm"
        />
      </div>
    </div>
  );
}
