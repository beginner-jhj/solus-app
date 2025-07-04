import { schedulePageStore,monthNames } from "./schedulePageStore";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { eventCategoryStyles } from "../../store/store.js";

export function DraggableDay({ day, month, events }) {
  const { isDragging, setIsDragging, setSelectedDays, selectedDays, currentIndex } =
    schedulePageStore();
  const [isSelected, setIsSelected] = useState(false);
  const [isToday, setIsToday] = useState(false);
  const dayRef = useRef();

  useEffect(() => {
    setIsSelected(false);
    setSelectedDays([]);
    setIsDragging(false);
  }, [currentIndex]);
 
  useEffect(() => {
    const today = new Date();
    if (day === today.getDate() && monthNames[month] === today.getMonth() + 1) {
      setIsToday(true);
    } else {
      setIsToday(false);
    }
  }, [day, month]);

  useEffect(() => {
    setIsSelected(() =>
      selectedDays.some((d) => d.day === day && d.month === month)
    );
  }, [selectedDays]);
  return (
    <div
      ref={dayRef}
      onMouseDown={() => {
        if (dayRef.current) {
          setIsDragging(true);
          setSelectedDays([{ day, month, ref: dayRef }]);
        }
      }}
      onMouseEnter={() => {
        if (!isDragging) return;

        setSelectedDays((prev) => {
          const alreadyIncluded = prev.some(
            (d) => d.day === day && d.month === month
          );
          return alreadyIncluded && dayRef.current
            ? prev
            : [...prev, { day, month, ref: dayRef }];
        });
      }}
      onMouseUp={() => {
        setIsDragging(false);
      }}
      className={`w-full h-[40px] relative flex flex-col items-start justify-start p-1 rounded-md cursor-pointer border ${
        isToday ? "border-blue-600 shadow-md" : "border-gray-400"
      } ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-300"}`}
    >
      <span className="font-semibold">{day}</span>
      {events?.slice(0, 4)?.map((event, index) => (
        <div
          key={index}
          className={`w-full h-[3px] rounded-md mt-0.5 ${
            eventCategoryStyles[event.event_category]?.bg
          }`}
        ></div>
      ))}
    </div>
  );
}