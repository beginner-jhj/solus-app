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
    <div className="w-full h-full grid grid-rows-[1fr_2fr] gap-y-2">
      {/* Assistant suggested message/action */}
      <div className="w-full h-full p-2"></div>

      {/* Today's schedule */}
      <div className="w-full h-full overflow-y-auto flex flex-col gap-y-2 p-2">
        {todayEvents.length === 0 ? (
          <span className="text-sm text-gray-500">No events for today.</span>
        ) : (
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold text-sm">Today's Schedule</span>
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className={`p-2 rounded-md border flex items-center justify-between ${categoryBorderColors[event.event_category] || "bg-gray-100 text-gray-700 border-gray-300"}`}
              >
              <span className="font-semibold text-sm">{event.title}</span>
              <span className="text-xs text-gray-500">
                {event.start_time ? event.start_time.slice(0, 5) : ""} -
                {" "}
                {event.end_time ? event.end_time.slice(0, 5) : ""}
              </span>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}