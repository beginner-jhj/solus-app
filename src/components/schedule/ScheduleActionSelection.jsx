import { schedulePageStore } from "./schedulePageStore";
import { useEffect, useState } from "react";
import { useRef } from "react";

export function ScheduleActionSelection() {
  const {
    isDragging,
    selectedDays,
    setShowActionPopup,
    setActionPopupPos,
    setFirstChatAction,
    currentIndex,
  } = schedulePageStore();
  const [show, setShow] = useState(false);
  const [positon, setPositon] = useState({ top: 0, left: 0 });
  const reportIconRef = useRef();
  const recommendIconRef = useRef();

  useEffect(() => {
    setShow(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!isDragging && selectedDays.length > 0) {
      setShow(true);
      const ref = selectedDays[selectedDays.length - 1].ref;
      const rect = ref.current.getBoundingClientRect();
      setPositon({ top: rect.top, left: rect.left });
    } else {
      setShow(false);
      setPositon({ top: 0, left: 0 });
    }
  }, [isDragging, selectedDays]);

  const handleIconClick = (iconRef) => {
    if (iconRef.current) {
      const iconRect = iconRef.current?.getBoundingClientRect();

      let top = 0;
      let left = 0;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (iconRect.top <= windowHeight / 2) {
        top = iconRect.top - 50;
      } else {
        top = iconRect.top - windowHeight / 2;
      }

      if (iconRect.left <= windowWidth / 2) {
        left = iconRect.left - 50;
      } else {
        left = iconRect.left - windowWidth / 2;
      }

      setShowActionPopup(true);
      setActionPopupPos({ top: top, left: left });
      setFirstChatAction(iconRef.current.title);
    }
  };
  return (
    <div
      style={{ top: positon.top - 30, left: positon.left }}
      className={`${
        show ? "flex" : "hidden"
      } fixed px-2 py-1 border border-gray-300 bg-white rounded-md shadow-md z-10 items-center gap-x-2`}
    >
      <span
        ref={reportIconRef}
        onClick={() => handleIconClick(reportIconRef)}
        className="cursor-pointer text-md"
        title="report"
      >
        📝
      </span>
      <span
        ref={recommendIconRef}
        onClick={() => handleIconClick(recommendIconRef)}
        className="cursor-pointer text-md"
        title="recommend"
      >
        💡
      </span>
    </div>
  );
}
