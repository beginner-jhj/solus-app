import { schedulePageStore } from "./schedulePageStore";
import { useEffect, useRef } from "react";
import prevIcon from "../../assets/prev-icon.svg";
import nextIcon from "../../assets/next-icon.svg";
import brainOnIcon from "../../assets/brain-on.svg";
import brainOffIcon from "../../assets/brain-off.svg";

export function CalendarNavigation({ month }) {
  const {
    currentIndex,
    setCurrentMonth,
    brainOn,
    setBrainOn,
    setSelectedDays,
    setShowActionPopup,
  } = schedulePageStore();
  const brainImgRef = useRef();

  useEffect(() => {
    if (brainOn) {
      brainImgRef.current.src = brainOnIcon;
    } else {
      brainImgRef.current.src = brainOffIcon;
      setSelectedDays([]);
    }
  }, [brainOn]);
  return (
    <div className="w-full h-full grid grid-cols-3 items-center justify-items-center">
      <button
        onClick={() => {
          if (currentIndex > 0) {
            setCurrentMonth(currentIndex - 1);
          }
        }}
      >
        <img src={prevIcon} className="w-4 h-4 cursor-pointer"></img>
      </button>
      <span className="font-semibold">{month}</span>
      <div className="w-full relative flex items-center justify-center">
        <button
          onClick={() => {
            if (currentIndex < 11) {
              setCurrentMonth(currentIndex + 1);
            }
          }}
        >
          <img src={nextIcon} className="w-4 h-4 cursor-pointer"></img>
        </button>
        <img
          ref={brainImgRef}
          onClick={() => {
            setBrainOn((prev) => !prev);
            setShowActionPopup(false);
          }}
          src={brainOffIcon}
          className="w-4 h-4 cursor-pointer absolute right-1"
        ></img>
      </div>
    </div>
  );
}