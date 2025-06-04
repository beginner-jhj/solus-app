import { useNavigate } from "react-router-dom";
import { schedulePageStore, monthNames } from "./schedulePageStore";
import { checkAuth } from "../../lib/lib.js";
import { useEffect, useRef } from "react";
import { Event } from "./Event";
import { SetEvent } from "./SetEvent";

export function DayModal() {
  const navigate = useNavigate();
  const congratMessage = useRef();
  const {
    openModal,
    selectedDay,
    setShowSetEvent,
    showSetEvent,
    setOpenModal,
    savedEvents,
    setSavedEvents,
    trigger,
    complete,
    setTrigger,
  } = schedulePageStore();

  useEffect(() => {
    const getSavedEvents = async () => {
      try {
        if (selectedDay.month && selectedDay.day) {
          const accessToken = await checkAuth(navigate);
          const response = await fetch(
            `http://localhost:8000/schedule/get_events?year=${new Date().getFullYear()}&month=${
              monthNames[selectedDay.month]
            }&day=${selectedDay.day}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const { data } = await response.json();
          if (response.ok) {
            if(data.length === 0){
              setShowSetEvent(true);
            }
            setSavedEvents([...data]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    getSavedEvents();
  }, [selectedDay, trigger]);

  useEffect(()=>{
    if(savedEvents.length>0){
      setShowSetEvent(false);
    }
  },[savedEvents]);

  return (
    <div
      onClick={(e) => {
        setOpenModal(false);
        e.stopPropagation();
      }}
      className={`w-full h-full z-50 fixed top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center ${
        openModal ? "flex" : "hidden"
      }`}
    >
      <div
        ref={congratMessage}
        className={`w-[180px] h-[30px] bg-blue-500 text-white absolute top-7 left-0 right-0 m-auto ${
          complete ? "flex" : "hidden"
        } items-center justify-center rounded-md shadow-md`}
      >
        <span>Awesome🎖️</span>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[320px] h-[400px] bg-white rounded-md flex flex-col items-start justify-start p-2 gap-y-2"
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-x-1">
            <div className="flex items-center gap-x-1">
              <span className="font-bold text-xl">{selectedDay.month}</span>
              <span className="font-bold text-xl">{selectedDay.day}th</span>
            </div>
            <button
              onClick={() => setShowSetEvent(true)}
              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
              title="Add new event"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setOpenModal(false)}
            className="cursor-pointer border border-gray-300 rounded-md px-2 py-1 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
          >
            Close
          </button>
        </div>
        <div className="w-full h-full flex flex-col overflow-y-auto gap-y-2 items-center justify-start">
          {showSetEvent ? <SetEvent setShowSetEvent={setShowSetEvent} selectedDay={selectedDay} setTrigger={setTrigger} /> : null}
          {savedEvents.map((event, index) => {
            return (
              <Event
                index={index}
                title={event.title}
                startTime={event.start_time}
                endTime={event.end_time}
                description={event.description}
                eventCategory={event.event_category}
                eventId={event.id}
                showEditIcon={true}
                showCompleteIcon={true}
                showDeleteIcon={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
