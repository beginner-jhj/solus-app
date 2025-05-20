import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { schedulePageStore, monthNames } from "./schedulePageStore.js";
import { checkAuth } from "../../lib/lib.js";

function SetEvent() {
  const navigate = useNavigate();
  const { showSetEvent, setShowSetEvent, selectedDay, setTrigger } =
    schedulePageStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventCategory, setEventCategory] = useState("Work");
  const [categorySelectBorderColor, setCategorySelectBorderColor] =
    useState("border-orange-300");

  useEffect(() => {
    switch (eventCategory) {
      case "Work":
        setCategorySelectBorderColor("border-blue-500");
        break;
      case "Personal":
        setCategorySelectBorderColor("border-yellow-500");
        break;
      case "Study":
        setCategorySelectBorderColor("border-green-500");
        break;
      case "Exercise":
        setCategorySelectBorderColor("border-red-500");
        break;
    }
  }, [eventCategory]);

  const handleChangeValue = (e, setState) => {
    setState(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (title.length !== 0) {
        const accessToken = await checkAuth(navigate);
        const response = await fetch(
          "http://localhost:8000/schedule/add_event",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              title,
              description,
              startTime,
              endTime,
              eventCategory,
              year: new Date().getFullYear(),
              month: monthNames[selectedDay.month],
              day: selectedDay.day,
            }),
          }
        );
        if (response.ok) {
          setShowSetEvent(false);
          setTrigger((prev) => !prev);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`w-full items-center justify-between  p-2 ${
        showSetEvent ? "flex" : "hidden"
      }`}
    >
      <details className="w-full" open>
        <summary className="w-full">
          <input
            required
            maxLength={200}
            placeholder="Got something coming up? Add it here."
            value={title}
            className="w-[230px] border-b border-gray-300 focus:border-[#295FA6] focus:outline-none hover:border-[#295FA6] transition-all "
            onChange={(e) => handleChangeValue(e, setTitle)}
          ></input>
        </summary>
        <div className="w-full flex flex-col items-start gap-y-1 mt-1">
          <textarea
            maxLength={200}
            placeholder="Add a description"
            value={description}
            className="w-full p-2 border-2 rounded-md border-gray-300 focus:border-[#295FA6] focus:outline-none hover:border-[#295FA6] transition-all "
            onChange={(e) => handleChangeValue(e, setDescription)}
          ></textarea>
          <div className="w-full grid grid-cols-2 gap-x-1 items-center justify-items-center">
            <div className="w-full flex items-center justify-between pr-2">
              <span className="font-semibold">Start</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleChangeValue(e, setStartTime)}
              ></input>
            </div>
            <div className="w-full flex items-center justify-between pl-2">
              <span className="font-semibold">End</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleChangeValue(e, setEndTime)}
              ></input>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <select
              value={eventCategory}
              onChange={(e) => handleChangeValue(e, setEventCategory)}
              className={`border-2 ${categorySelectBorderColor} focus:outline-none focus:${categorySelectBorderColor} cursor-pointer rounded-md p-1`}
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Exercise">Exercise</option>
            </select>
            <div className="flex items-center gap-x-1">
              <button
                onClick={() => setShowSetEvent(false)}
                className="border-2 border-gray-500 p-1 rounded-md cursor-pointer text-gray-500 hover:bg-red-500  hover:border-red-500 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="border-2 border-[#295FA6] p-1 rounded-md cursor-pointer text-[#295FA6] hover:bg-[#295FA6] hover:text-white transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

export { SetEvent };
