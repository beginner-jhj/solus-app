import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../lib/lib.js";

export default function Home() {
  const navigate = useNavigate();
  const [todayEvents, setTodayEvents] = useState([]);

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
          const dataToStore = data.length === 0 ? [] : data.map((event)=>({title:event.title,description:event.description,startTime:event.start_time,endTime:event.end_time}));
          localStorage.setItem("todayEvents", JSON.stringify([new Date().toISOString().split("T")[0],dataToStore]));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTodayEvents();
  }, [navigate]);

  const categoryBorderColors = {
    Work: "border-blue-300",
    Study: "border-green-300",
    Personal: "border-yellow-300",
    Exercise: "border-red-300",
  };

  return (
    <div className="w-full h-full grid grid-rows-[1fr_1fr] gap-y-2">
      <div className="w-full h-full p-2">

      </div>
      <div className="w-full h-full grid grid-rows-[10%_90%] items-center justify-items-start gap-y-2">
        <span className="font-semibold text-sm">Today's Schedule</span>
        <div className="w-full h-full flex flex-col gap-y-1 overflow-y-auto">
          {todayEvents.length > 0 && (
            <>
            {todayEvents.map((event,index) => (
            <div
                key={index}
                className={`p-2 rounded-md border-2 flex items-center justify-between hover:shadow-md transition-all ${categoryBorderColors[event.event_category] || "bg-gray-100 text-gray-700 border-gray-300"}`}
              >
              <span className="font-semibold text-sm">{event.title}</span>
              <span className="text-xs text-gray-500">
                {event.start_time ? event.start_time.slice(0, 5) : ""} -
                {" "}
                {event.end_time ? event.end_time.slice(0, 5) : ""}
              </span>
            </div>
            ))}
            </>
          )}
          {todayEvents.length === 0 && (
            <span className="font-semibold text-gray-500 text-sm">No events for today.</span>
          )} 
        </div>
      </div>
    </div>
  );
}