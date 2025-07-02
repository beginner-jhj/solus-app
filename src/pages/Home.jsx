import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../lib/lib.js";
import { eventCategoryStyles } from "../store/store.js";

export default function Home() {
  const navigate = useNavigate();
  const [todayEvents, setTodayEvents] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [lastSuggestion, setLastSuggestion] = useState(
    localStorage.getItem("lastSuggestion") || ""
  );
  const todayEventsStore = JSON.parse(localStorage.getItem("todayEvents"));
  const lastSuggestionTime = localStorage.getItem("lastSuggestionTime");

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date();
        const accessToken = await checkAuth(navigate);

        if (!accessToken) return;

        const response = await fetch(
          `http://localhost:8000/schedule/get_events?year=${today.getFullYear()}&month=${
            today.getMonth() + 1
          }&day=${today.getDate()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { data } = await response.json();
        if (response.ok) {
          setTodayEvents(data);
          const dataToStore =
            data.length === 0
              ? []
              : data.map((event) => ({
                  title: event.title,
                  description: event.description,
                  startTime: event.start_time,
                  endTime: event.end_time,
                }));
          localStorage.setItem(
            "todayEvents",
            JSON.stringify([
              new Date().toISOString().split("T")[0],
              dataToStore,
            ])
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTodayEvents();
  }, [navigate]);

  useEffect(() => {
    const timeToMinutes = (timeStr) => {
      if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":"))
        return 0;
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const getCurrentTimeInMinutes = () => {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    };

    const lastSuggestionTimeInMinutes = timeToMinutes(lastSuggestionTime);

    const within1HourSchedule = todayEventsStore[1].filter((event) => {
      const targetTime = timeToMinutes(event.startTime);
      const currentTime = getCurrentTimeInMinutes();
      return Math.abs(targetTime - currentTime) <= 80;
    });

    if (
      Math.abs(getCurrentTimeInMinutes() - lastSuggestionTimeInMinutes) <= 30
    ) {
      return;
    }

    const getSuggesion = async () => {
      try {
        const accessToken = await checkAuth(navigate);
        if (!accessToken) return;
        const response = await fetch(
          `http://localhost:8000/assistant/get_suggestion`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hasSchedule: within1HourSchedule.length > 0,
              schedule: within1HourSchedule,
              clientTime: new Date().toTimeString().split(" ")[0],
              clientDate: new Date().toISOString().split("T")[0],
            }),
          }
        );
        const { data } = await response.json();
        if (response.ok) {
          setSuggestion(data.suggestion);
          setLastSuggestion(data.suggestion);
          localStorage.setItem("lastSuggestion", data.suggestion);
          localStorage.setItem(
            "lastSuggestionTime",
            `${new Date().getHours()}:${new Date().getMinutes()}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    getSuggesion();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-y-3 p-2">
      <div className="flex-1 w-full overflow-y-auto">
        <div className="w-full h-full bg-blue-50 border border-blue-200 rounded-md shadow-sm p-3 flex flex-col">
          <span className="font-semibold text-blue-700 text-sm mb-1">
            Suggestion
          </span>
          <p className="text-sm text-gray-700 whitespace-pre-line flex-grow">
            {suggestion || lastSuggestion || "No suggestions right now."}
          </p>
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col overflow-y-auto gap-y-2">
        <span className="font-semibold text-sm mb-1">Today's Schedule</span>
        <div className="flex flex-col gap-y-2 overflow-y-auto">
          {todayEvents.length > 0 ? (
            todayEvents.map((event, index) => (
              <div
                key={index}
                className={`p-2 rounded-md border-l-4 shadow-sm flex items-center justify-between bg-white ${
                  eventCategoryStyles[event.event_category]?.border ||
                  "border-gray-300"
                }`}
              >
                <span className="font-semibold text-xs">{event.title}</span>
                <span className="text-xs text-gray-500">
                  {event.start_time ? event.start_time.slice(0, 5) : ""} -{" "}
                  {event.end_time ? event.end_time.slice(0, 5) : ""}
                </span>
              </div>
            ))
          ) : (
            <span className="font-semibold text-gray-500 text-sm">
              No events for today.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
