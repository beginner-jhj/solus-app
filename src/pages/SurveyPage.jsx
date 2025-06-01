import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function SurveyPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [askNickname, setAskNickname] = useState("What should we call you?");
  const hello = "Hi I'm Solus";
  const helloBox = useRef();

  useEffect(() => {
    if (navigator.language.startsWith("ko")) {
      setAskNickname("어떻게 불러 드릴까요?");
    }
  }, []);

  const saveSurveyData = (e) => {
    // Allow form submission via button click or Enter key press in any field
    if (e.type === "submit" || (e.key === "Enter" && (nickname.trim() !== "" || likes.trim() !== "" || dislikes.trim() !== ""))) {
      e.preventDefault();
      if (nickname.trim() === "" || likes.trim() === "" || dislikes.trim() === "") {
        alert("Please fill in all fields");
        return;
      }
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("likes", likes);
      localStorage.setItem("dislikes", dislikes);
      navigate("/");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveSurveyData(e);
    }
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
        <h1 className="mb-6 text-2xl font-bold text-center">Tell me about yourself!</h1>
        <form onSubmit={saveSurveyData} className="flex flex-col">
          <input
            type="text"
            placeholder={askNickname}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="What I like"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="What I dislike"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
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
