import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function AskNickname() {
  const navigate = useNavigate();
  const [ask, setAsk] = useState("How can I call you?");
  const [nickName, setNickName] = useState(null);
  const hello = "Hi I'm Solus";
  const helloBox = useRef();
  useEffect(() => {
    if (navigator.language.startsWith("ko")) setAsk("어떻게 불러 드릴까요?");
  }, []);
  const changeNickName = (e) => {
    setNickName(e.target.value);
  };
  const saveNickName = (e) => {
    if (e.key === "Enter" && nickName) {
      localStorage.setItem("nickname", nickName);
      navigate("/");
    }
  };
  return (
    <div className='w-80 h-40 flex flex-col items-center justify-center relative p-6'>
      <div className='absolute top-4 left-4 flex items-center'>
        <img src={logo} className='w-7 h-7' />
        <div ref={helloBox} className='text-xl font-bold text-center'>
          {hello.split(" ").map((char, index) => (
            <span
              className='bounce-char font-bold ml-2'
              style={{ animationDelay: `${index * 0.1}s` }}>
              {char}
            </span>
          ))}
        </div>
      </div>
      <input
        placeholder={ask}
        type='text'
        className='px-4 py-2 border border-gray-300 rounded-md hover:shadow-md transition bg-white mt-2'
        onChange={changeNickName}
        onKeyDown={saveNickName}></input>
    </div>
  );
}
