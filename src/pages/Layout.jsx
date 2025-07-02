import { useEffect, useRef, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";
import homeBlack from "../assets/home-black.svg";
import homeGray from "../assets/home-gray.svg";
import scheduleBlack from "../assets/schedule-black.svg";
import scheduleGray from "../assets/schedule-gray.svg";
import webBalck from "../assets/web-black.svg";
import webGray from "../assets/web-gray.svg";
import nameTag from "../assets/nametag.svg";
import user from "../assets/user.svg";
import setting from "../assets/setting.svg";
import logoutIcon from "../assets/logout.svg";
import { checkAuth } from "../lib/lib.js";
import { store } from "../store/store.js";

export default function Layout() {
  const navigate = useNavigate();
  const { setNickname } = store();
  const { profileImageURL, setProfileImageURL } = store();
  const [userName, setUserName] = useState(null);
  const [openProfileBox, setOpenProfileBox] = useState(false);
  const profileBox = useRef();

  useEffect(() => {
    const didSurvey = localStorage.getItem("didSurvey");
    if (!didSurvey) {
      navigate("/survey");
    }
  }, [navigate]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const accessToken = await checkAuth(navigate);

        if (accessToken) {
          const response = await fetch(
            "http://localhost:8000/user/get_profile",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            }
          );
          const jsonRes = await response.json();
          if (response.status === 200) {
            setProfileImageURL(jsonRes.profileImage);
            setUserName(jsonRes.name);
            setNickname(jsonRes.nickname);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    getProfile();
  }, [navigate]);

  useEffect(()=>{
    const clickOutside = (e)=>{
      if(profileBox.current && !profileBox.current.contains(e.target)){
        setOpenProfileBox(false);
      }
    }
    document.addEventListener("click",clickOutside);
    return ()=>{
      document.removeEventListener("click",clickOutside);
    }
  },[openProfileBox])

  const logout = () => {
    chrome.runtime.sendMessage({ type: "REMOVE_ACCESS_TOKEN" });
    chrome.runtime.sendMessage({ type: "REMOVE_REFRESH_TOKEN" });
    navigate("/signin");
  };

  // Remove profileBoxToggle and use conditional styles instead


  return (
    <div className="w-80 h-[400px] bg-white grid items-center justify-items-center grid-rows-[30px_30px_320px] gap-y-[15px]">
      <header className="w-full h-full flex items-center justify-between">
        <div className="h-full flex">
          <img className="w-8 h-8" src={logo}></img>
          <span
            className="
          text-2xl font-bold mb-2"
          >
            Solus
          </span>
        </div>
        <img
          className="w-8 h-8 border rounded-[50%] border-gray-300 hover:shadow-lg hover:border-2 cursor-pointer"
          src={profileImageURL}
          onClick={(e) => { e.stopPropagation(); setOpenProfileBox((prev) => !prev); }}
        ></img>
      </header>
      <div
        ref={profileBox}
        onClick={(e) => e.stopPropagation()}
        className={`w-30 z-10 bg-white shadow-lg rounded-md absolute right-1 top-13 transition-all duration-200 overflow-hidden flex flex-col items-center justify-around p-1 ${openProfileBox ? 'h-[110px] border-2 border-[oklch(87.2%_0.01_258.338)]' : 'h-0 border-none'}`}
      >
        <div className="w-full flex items-center justify-between px-1">
          <div className="w-1/3 flex">
            <img className="w-4 h-5" src={nameTag}></img>
            <span className="text-gray-300 text-[13px] font-semibold ml-1">
              Name
            </span>
          </div>
          <span className="font-semibold text-[14px]">{userName}</span>
        </div>
        <div className="w-full flex items-center justify-start px-1">
          <img className="w-4 h-5" src={user}></img>
          <Link to="/my-profile" className="font-semibold text-[13px] ml-2 cursor-pointer hover:text-blue-600">
            My Profile
          </Link>
        </div>
        <div className="w-full flex items-center justify-start">
          <img className="w-5 h-5" src={logoutIcon}></img>
          <span
            onClick={logout}
            className="font-semibold text-[13px] ml-2 cursor-pointer hover:text-blue-600"
          >
            Logout
          </span>
        </div>
      </div>
      <Navigation />
      <Outlet />
    </div>
  );
}

function Navigation() {
  const currentPath = useLocation();
  const [isHome, setIsHome] = useState(true);
  const [isSchedule, setIsSchedule] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  useEffect(() => {
    const page = currentPath.pathname;

    const pagePath = page.split("/")[1];

    switch (pagePath) {
      case "schedule":
        setIsSchedule(true);
        setIsHome(false);
        setIsAssistant(false);
        break;
      case "assistant":
        setIsAssistant(true);
        setIsHome(false);
        setIsSchedule(false);
        break;
      default:
        setIsHome(true);
        setIsSchedule(false);
        setIsAssistant(false);
    }
  }, [currentPath.pathname, currentPath]);
  return (
    <div className="w-full h-full flex items-center justify-between gap-x-1">
      <Link
        to={"/"}
        className="w-11/12 h-[30px] border border-gray-300 rounded-md bg-white flex items-center justify-center gap-x-1 font-semibold cursor-pointer"
      >
        <img className="h-4" src={isHome ? homeBlack : homeGray}></img>
        <span className={`${isHome ? "text-blue-600" : "text-gray-300"}`}>
          Home
        </span>
      </Link>
      <Link
        to={"/assistant"}
        className="w-11/12 h-[30px] border border-gray-300 rounded-md bg-white flex items-center justify-center font-semibold cursor-pointer"
      >
        <img className="h-4" src={isAssistant ? webBalck : webGray}></img>
        <span className={`${isAssistant ? "text-blue-600" : "text-gray-300"}`}>
          Assistant
        </span>
      </Link>
      <Link
        to={"/schedule"}
        className="w-11/12 h-[30px] border border-gray-300 rounded-md bg-white flex items-center justify-center gap-x-1 font-semibold cursor-pointer"
      >
        <img
          className="h-4"
          src={isSchedule ? scheduleBlack : scheduleGray}
        ></img>
        <span className={`${isSchedule ? "text-blue-600" : "text-gray-300"}`}>
          Schedule
        </span>
      </Link>
    </div>
  );
}
