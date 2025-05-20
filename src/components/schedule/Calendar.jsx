import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { schedulePageStore, monthNames } from "./schedulePageStore";
import { checkAuth } from "../../lib/lib.js";
import { Day } from "./Day";
import { DraggableDay } from "./DraggableDay";
import { ScheduleActionSelection } from "./ScheduleActionSelection";
import { ActionPopup } from "./ActionPopup";


export function Calendar({ days, month, firstDayOfWeek, prevMonthDays }) {
    const navigate = useNavigate();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totalDays = firstDayOfWeek + days;
    const totalCells = Math.ceil(totalDays / 7) * 7;
  
    const { setIsDragging, brainOn, openModal } = schedulePageStore();
  
    const [eventsMap, setEventsMap] = useState({});
  
    useEffect(() => {
      const getMonthEvents = async () => {
        try {
          const accessToken = await checkAuth(navigate);
          const response = await fetch(
            `http://localhost:8000/schedule/get_events?year=${new Date().getFullYear()}&month=${
              monthNames[month]
            }&day=all`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const { data } = await response.json();
  
          if (response.ok) {
            const newEventsMap = {};
            data.forEach((event) => {
              newEventsMap[event.day] = newEventsMap[event.day] || [];
              newEventsMap[event.day].push(event);
            });
            setEventsMap(newEventsMap);
          }
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };
      getMonthEvents();
    }, [month, openModal]);
  
    return (
      <div
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        className="w-[320px] h-full gap-1 grid grid-rows-6 grid-cols-7 items-center justify-items-center"
      >
        {weekDays.map((day) => (
          <div className="w-full h-full flex items-center justify-center font-semibold">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div className="w-full h-[40px] flex flex-col items-start justify-start p-1 rounded-md cursor-pointer border border-gray-300">
            {prevMonthDays - firstDayOfWeek + i + 1}
          </div>
        ))}
        {Array.from({ length: days }, (_, i) =>
          brainOn ? (
            <DraggableDay day={i + 1} month={month} events={eventsMap[i + 1]} />
          ) : (
            <Day day={i + 1} month={month} events={eventsMap[i + 1]} />
          )
        )}
        {Array.from({ length: totalCells - totalDays }).map((_, i) => (
          <div className="w-full h-[40px] flex flex-col items-start justify-start p-1 rounded-md cursor-pointer border border-gray-300">
            {i + 1}
          </div>
        ))}
        <ScheduleActionSelection />
        <ActionPopup />
      </div>
    );
  }