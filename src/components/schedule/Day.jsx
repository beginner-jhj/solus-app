import { schedulePageStore, monthNames } from "./schedulePageStore";
import { useEffect, useState } from "react";

export function Day({ day, month, events }) {
  const { setOpenModal, setSelectedDay } = schedulePageStore();
  const [isToday, setIsToday] = useState(false);
  const divColorByCategory = {
    Work: "bg-blue-400",
    Personal: "bg-yellow-400",
    Study: "bg-green-400",
    Exercise: "bg-red-400",
  };

  useEffect(() => {
    const today = new Date();
    if (day === today.getDate() && monthNames[month] === today.getMonth() + 1) {
      setIsToday(true);
    } else {
      setIsToday(false);
    }
  }, [day, month]);

  return (
    <div
      onClick={() => {
        setOpenModal(true);
        setSelectedDay({ day, month });
      }}
      className={`w-full h-[40px] relative flex flex-col items-start justify-start p-1 rounded-md cursor-pointer border ${
        isToday ? "border-blue-600 shadow-md" : "border-gray-400"
      }`}
    >
      <span className="font-semibold">{day}</span>
      {events?.slice(0, 4)?.map((event, index) => (
        <div
          key={index}
          className={`w-full h-[3px] rounded-md mt-0.5 ${
            divColorByCategory[event.event_category]
          }`}
        ></div>
      ))}
    </div>
  );
}