import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import completeColoredIcon from "../../assets/complete-colored.svg";
import deleteIcon from "../../assets/delete.svg";
import editIconBlack from "../../assets/pencil-black.svg";
import editIconGray from "../../assets/pencil-gray.svg";
import completeIcon from "../../assets/complete.svg";
import { checkAuth } from "../../lib/lib.js";
import { schedulePageStore } from "./schedulePageStore.js";

export function Event({
    index,
    title,
    startTime,
    endTime,
    description,
    eventCategory,
    eventId,
    showEditIcon,
    showCompleteIcon,
    showDeleteIcon,
  }) {
    // Color and icon for category
    const categoryColors = {
      Work: "bg-blue-100 text-blue-700 border-blue-400",
      Study: "bg-green-100 text-green-700 border-green-400",
      Personal: "bg-yellow-100 text-yellow-700 border-yellow-400",
      Exercise: "bg-red-100 text-red-700 border-red-400",
    };
    const categoryClass =
      categoryColors[eventCategory] ||
      "bg-gray-100 text-gray-700 border-gray-300";
  
    // For time icon
    const clockIcon = (
      <svg
        className="w-4 h-4 inline mr-1 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
      </svg>
    );
  
    // ...rest of your hooks and logic
    const navigate = useNavigate();
    const { setTrigger, setComplete } = schedulePageStore();
    const [isHover, setIsHover] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedDescription, setEditedDescription] = useState(description);
    const [editedStartTime, setEditedStartTime] = useState(startTime);
    const [editedEndTime, setEditedEndTime] = useState(endTime);
    const [editedEventCategory, setEditedEventCategory] = useState(eventCategory);
  
    const completeIconImg = useRef();
    useEffect(() => {
      if (isHover) {
        if (completeIconImg.current) {
          completeIconImg.current.src = completeColoredIcon;
        }
      } else {
        if (completeIconImg.current) {
          completeIconImg.current.src = completeIcon;
        }
      }
    }, [isHover]);
  
    const handleDeleteEvent = async (e) => {
      try {
        const accessToken = await checkAuth(navigate);
        const response = await fetch(
          `http://localhost:8000/schedule/delete_event?id=${e.target.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          setTrigger((prev) => !prev);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const handleCompleteEvent = async (e) => {
      try {
        const accessToken = await checkAuth(navigate);
        const response = await fetch(
          `http://localhost:8000/schedule/complete_event?id=${e.target.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          setTrigger((prev) => !prev);
          setComplete(true);
          setTimeout(() => {
            setComplete(false);
          }, 1500);
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleEditEvent = async (e) => {
      try {
        const accessToken = await checkAuth(navigate);
        const response = await fetch(
          `http://localhost:8000/schedule/edit_event?id=${e.target.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              title: editedTitle,
              description: editedDescription,
              startTime: editedStartTime,
              endTime: editedEndTime,
              eventCategory: editedEventCategory,
            }),
          }
        );
        if (response.ok) {
          setTrigger((prev) => !prev);
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    return (
      <div
        key={index}
        className={`w-full rounded-lg border ${categoryClass} shadow-sm p-3 mb-1 hover:shadow-lg transition-all flex flex-col items-start justify-start`}
      >
        <div className="w-full flex items-center justify-between mb-1">
          {editing ? (
            <input
              placeholder="Title"
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className={`w-1/3 font-bold text-[14px] text-gray-900 border-b border-gray-400 focus:outline-none`}
            />
          ) : (
            <span className="font-bold text-[14px] text-gray-900">{title}</span>
          )}
          <span className="text-xs text-gray-500 flex items-center">
            {editing ? null : clockIcon}
            {editing ? (
              <>
                <input
                  type="time"
                  value={editedStartTime}
                  onChange={(e) => setEditedStartTime(e.target.value)}
                />
                -
                <input
                  type="time"
                  value={editedEndTime}
                  onChange={(e) => setEditedEndTime(e.target.value)}
                />
              </>
            ) : (
              <>
                {startTime  ? startTime.slice(0, 5) : "∞"} - {endTime ? endTime.slice(0, 5) : "∞"}
              </>
            )}
          </span>
        </div>
        <div className="w-full text-xs text-gray-700 mb-2 whitespace-pre-line">
          {editing ? (
            <textarea
              placeholder="Description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className={`w-full h-[50px] p-1 border rounded-md border-gray-400 focus:outline-none`}
            />
          ) : (
            <span>{description}</span>
          )}
        </div>
        <div className="w-full flex items-center justify-between">
          {editing ? (
            <select
              placeholder="Category"
              value={editedEventCategory}
              onChange={(e) => setEditedEventCategory(e.target.value)}
              className={`border rounded-md border-gray-400 p-1 focus:outline-none`}
            >
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Exercise">Exercise</option>
            </select>
          ) : (
            <span
              className={`p-1 text-xs font-semibold rounded-md border ${categoryClass} text-center`}
            >
              {eventCategory}
            </span>
          )}
          <div className="flex items-center gap-x-2">
            {showEditIcon &&
              (editing ? (
                <img
                  id={eventId}
                  src={editIconBlack}
                  onClick={(e) => {
                    setEditing(false);
                    handleEditEvent(e);
                  }}
                  alt="Edit"
                  className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
                />
              ) : (
                <img
                  id={eventId}
                  src={editIconGray}
                  onClick={() => {
                    setEditing(true);
                  }}
                  alt="Edit"
                  className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
                />
              ))}
            {showCompleteIcon && (
              <img
                id={eventId}
                onClick={handleCompleteEvent}
                ref={completeIconImg}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                src={completeIcon}
                alt="Complete"
                className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
              />
            )}
            {showDeleteIcon && (
              <img
                id={eventId}
                onClick={handleDeleteEvent}
                src={deleteIcon}
                alt="Delete"
                className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
              />
            )}
          </div>
        </div>
      </div>
    );
  }