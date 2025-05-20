import { useEffect, useState } from "react";
import { CalendarNavigation } from "../components/schedule/CalendarNavigation.jsx";
import { Calendar } from "../components/schedule/Calendar.jsx";
import { DayModal } from "../components/schedule/DayModal.jsx";
import { schedulePageStore } from "../components/schedule/schedulePageStore.js";

export default function Schedule() {
  const { currentIndex } = schedulePageStore();
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(months[currentIndex]);

  useEffect(() => {
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const year = new Date().getFullYear();
    if (isLeapYear(year)) {
      setMonths([
        [
          {
            days: 31,
            name: "January",
            firstDay: new Date(year, 0, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 29,
            name: "February",
            firstDay: new Date(year, 1, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "March",
            firstDay: new Date(year, 2, 1).getDay(),
            prevMonthDays: 29,
          },
        ],
        [
          {
            days: 30,
            name: "April",
            firstDay: new Date(year, 3, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "May",
            firstDay: new Date(year, 4, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
        [
          {
            days: 30,
            name: "June",
            firstDay: new Date(year, 5, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "July",
            firstDay: new Date(year, 6, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
        [
          {
            days: 31,
            name: "August",
            firstDay: new Date(year, 7, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 30,
            name: "September",
            firstDay: new Date(year, 8, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "October",
            firstDay: new Date(year, 9, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
        [
          {
            days: 30,
            name: "November",
            firstDay: new Date(year, 10, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "December",
            firstDay: new Date(year, 11, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
      ]);
    } else {
      setMonths([
        [
          {
            days: 31,
            name: "January",
            firstDay: new Date(year, 0, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 28,
            name: "February",
            firstDay: new Date(year, 1, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "March",
            firstDay: new Date(year, 2, 1).getDay(),
            prevMonthDays: 28,
          },
        ],
        [
          {
            days: 30,
            name: "April",
            firstDay: new Date(year, 3, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "May",
            firstDay: new Date(year, 4, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
        [
          {
            days: 30,
            name: "June",
            firstDay: new Date(year, 5, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "July",
            firstDay: new Date(year, 6, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
        [
          {
            days: 31,
            name: "August",
            firstDay: new Date(year, 7, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 30,
            name: "September",
            firstDay: new Date(year, 8, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "October",
            firstDay: new Date(year, 9, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
        [
          {
            days: 30,
            name: "November",
            firstDay: new Date(year, 10, 1).getDay(),
            prevMonthDays: 31,
          },
        ],
        [
          {
            days: 31,
            name: "December",
            firstDay: new Date(year, 11, 1).getDay(),
            prevMonthDays: 30,
          },
        ],
      ]);
    }
  }, []);

  useEffect(() => {
    if (months.length > 0) {
      setCurrentMonth(months[currentIndex]);
    }
  }, [months, currentIndex]);

  return (
    <div className="w-full h-full overflow-x-hidden grid grid-rows-[20px_290px] items-center justify-items-center">
      <CalendarNavigation month={currentMonth ? currentMonth[0].name : ""} />
      {currentMonth
        ? currentMonth.map((month, index) => (
            <Calendar
              days={month.days}
              month={month.name}
              firstDayOfWeek={month.firstDay}
              prevMonthDays={month.prevMonthDays}
              key={index}
            />
          ))
        : null}
      <DayModal />
    </div>
  );
}
