import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function SurveyPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [likes, setLikes] = useState([]);
  const [location, setLocation] = useState("");
  const [dailyRoutine, setDailyRoutine] = useState("");
  const [personalGoal, setPersonalGoal] = useState("");
  const [step, setStep] = useState(0);
  const hello = "Hi I'm Solus";
  const helloBox = useRef();

  const categories = [
    "🍳 Cooking",
    "🏋️‍♂️ Exercise",
    "🛠️ Engineering",
    "🎬 Movies",
    "📚 Reading",
    "✈️ Traveling",
    "🎨 Drawing",
    "🎮 Gaming",
    "🎸 Playing Music",
    "🧩 Puzzles",
    "📷 Photography",
    "🌱 Gardening",
    "✍️ Writing",
    "🧘‍♀️ Meditation",
    "🧶 Knitting",
    "🃏 Board Games",
    "🎤 Singing",
    "💃 Dancing",
    "🏞️ Hiking",
    "🚴‍♂️ Cycling",
    "🧪 Science Experiments",
    "🕹️ Retro Gaming",
    "🔭 Stargazing",
    "🍿 Binge-watching",
  ];

  const saveSurveyData = (e) => {
    e.preventDefault();
    if (
      nickname.trim() === "" ||
      likes.length === 0 ||
      location.trim() === "" ||
      dailyRoutine.trim() === "" ||
      personalGoal.trim() === ""
    ) {
      alert("Please fill in all fields");
      return;
    }
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("likes", JSON.stringify(likes));
    localStorage.setItem("residence", location);
    localStorage.setItem("daily_routine", dailyRoutine);
    localStorage.setItem("personal_goals", personalGoal);
    navigate("/");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (step < 4) {
        e.preventDefault();
        setStep((s) => s + 1);
      } else {
        saveSurveyData(e);
      }
    }
  };

  const toggleCategory = (category) => {
    setLikes((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <label className="mb-2 font-medium block" htmlFor="nickname">
              What should I call you?
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="e.g., John"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        );
      case 1:
        return (
          <div className="mb-4">
            <p className="mb-2 font-medium">What do you like?</p>
            <div className="grid grid-cols-2 gap-2" tabIndex="0" onKeyDown={handleKeyPress}>
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`cursor-pointer border rounded px-2 py-1 text-sm ${likes.includes(category) ? "bg-blue-500 text-white" : "bg-white"}`}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="mb-2 font-medium block" htmlFor="location">
              Where do you live?
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g., Seoul, Los Angeles, New York"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <label className="mb-2 font-medium block" htmlFor="daily">
              What's your typical day like?
            </label>
            <textarea
              id="daily"
              placeholder="e.g., I usually wake up at 7am and go to gym at 8am"
              value={dailyRoutine}
              onChange={(e) => setDailyRoutine(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 resize-none"
            />
          </div>
        );
      case 4:
        return (
          <div>
            <label className="mb-2 font-medium block" htmlFor="goal">
              Any personal goals lately?
            </label>
            <input
              id="goal"
              type="text"
              placeholder="e.g., I want to travel to New York"
              value={personalGoal}
              onChange={(e) => setPersonalGoal(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 flex flex-col items-center justify-center bg-gray-100">
      <div className="p-10 bg-white rounded w-full">
        <div className="flex items-center mb-6">
          <img src={logo} className="w-7 h-7 mr-2" alt="logo" />
          <div ref={helloBox} className="text-xl font-bold">
            {hello.split(" ").map((char, index) => (
              <span
                key={index}
                className="bounce-char font-bold ml-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <h1 className="mb-6 text-xl font-bold text-center">Tell me about yourself!</h1>
        <form onSubmit={saveSurveyData} className="flex flex-col">
          {renderStep()}
          <div className="flex justify-between mt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-white bg-gray-400 rounded hover:bg-gray-500"
              >
                Prev
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Save Survey
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
