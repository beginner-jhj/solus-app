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
    if (
      e.type === "submit" ||
      (e.key === "Enter" &&
        (nickname.trim() !== "" || likes.length > 0 || location.trim() !== ""))
    ) {
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveSurveyData(e);
    }
  };

  const toggleCategory = (category) => {
    setLikes((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="w-80 flex flex-col items-center justify-center bg-gray-100">
      <div className="p-10 bg-white rounded w-full">
        <div className='flex items-center mb-6'>
          <img src={logo} className='w-7 h-7 mr-2' alt="logo"/>
          <div ref={helloBox} className='text-xl font-bold'>
            {hello.split(" ").map((char, index) => (
              <span
                key={index}
                className='bounce-char font-bold ml-1'
                style={{ animationDelay: `${index * 0.1}s` }}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <h1 className="mb-6 text-xl font-bold text-center">Tell me about yourself!</h1>
        <form onSubmit={saveSurveyData} className="flex flex-col">
          <input
            type="text"
            placeholder="What should I call you?"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />

          <div className="mb-4">
            <p className="mb-2 font-medium">What do you like?</p>
            <select
              value={likes}
              onChange={(e) => toggleCategory(e.target.value)}
              multiple={true}
              className="w-full cursor-pointer px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            >
              {categories.map((category)=>(
                <option key={category} className="cursor-pointer">{category}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Where do you live? (e.g., Seoul, Los Angeles, New York)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />

          <textarea
            placeholder="What's your typical day like? (e.g., I usually wake up at 7am and go to gym at 8am)"
            value={dailyRoutine}
            onChange={(e) => setDailyRoutine(e.target.value)}
            className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 resize-none"
          />

          <input
            type="text"
            placeholder="Any personal goals lately? (e.g., I want to lose weight, I want to learn cooking, I want to travel to New York)"
            value={personalGoal}
            onChange={(e) => setPersonalGoal(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 cursor-pointer"
          >
            Save Survey
          </button>
        </form>
      </div>
    </div>
  );
}
