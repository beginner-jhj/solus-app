import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import ErrorNotification from "../components/common/ErrorNotification";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import { checkAuth } from "../lib/lib.js";

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
  const [openNotification, setOpenNotification] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    "🍳 Cooking",
    "🏋️‍♂️ Exercise",
    "🛠️ Engineering",
    "🎬 Movies",
    "📚 Reading",
    "✈️ Traveling",
    "🎨 Drawing",
    "🎮 Gaming",
    "🎸 Music",
  ];

  const saveSurveyData = async (e) => {
    e.preventDefault();
    if (
      nickname.trim() === "" ||
      likes.length === 0 ||
      location.trim() === "" ||
      dailyRoutine.trim() === "" ||
      personalGoal.trim() === ""
    ) {
      setOpenNotification(true);
      return;
    }

    localStorage.setItem("nickname", nickname);

    localStorage.setItem('didSurvey', true);

    try {
      setLoading(true);
      const accessToken = await checkAuth(navigate);
      await fetch("http://localhost:8000/user/save_survey_result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          nickname,
          likes: JSON.stringify(likes.map((like)=>([like.split(" ")[1], []]))),
          location,
          dailyRoutine,
          personalGoal,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    navigate("/");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (step < 4) {
        e.preventDefault();
        setStep((s) => s + 1);
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
            <div className="grid grid-cols-3 grid-rows-3 gap-1" tabIndex="0" onKeyDown={handleKeyPress}>
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`w-full h-full cursor-pointer border rounded border-gray-300 flex items-center justify-center text-sm p-3 ${likes.includes(category) ? "bg-blue-500 text-white" : "bg-white"}`}
                >
                  <p className="text-center">{category}</p>
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
    <div className="w-80 flex flex-col items-center justify-center bg-gray-100 relative">
      <ErrorNotification
        open={openNotification}
        message="Please fill in all fields"
        onClose={() => setOpenNotification(false)}
        severity="error"
        duration={2000}
      />
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
        <div className="flex flex-col">
          {renderStep()}
          <div className="flex justify-between mt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-white bg-gray-400 rounded hover:bg-gray-500 cursor-pointer"
              >
                Prev
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={saveSurveyData}
                className="ml-auto px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 cursor-pointer"
              >
                Save Survey
              </button>
            )}
          </div>
        </div>
      </div>
      {loading && <LoadingOverlay />}
    </div>
  );
}
