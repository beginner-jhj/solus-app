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
  const { profileImageURL, setProfileImageURL } = store();
  const [userName, setUserName] = useState(null);
  const [openProfilBox, setOpenProfileBox] = useState(false);
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
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    getProfile();
  }, [navigate]);

  const logout = () => {
    chrome.runtime.sendMessage({ type: "REMOVE_ACCESS_TOKEN" });
    chrome.runtime.sendMessage({ type: "REMOVE_REFRESH_TOKEN" });
    navigate("/signin");
  };

  const profileBoxToggle = () => {
    profileBox.current.style.height = openProfilBox ? "140px" : "0px";
    profileBox.current.style.border = openProfilBox
      ? "2px solid oklch(87.2% 0.01 258.338)"
      : "none";
  };

  useEffect(profileBoxToggle, [openProfilBox]);

  return (
    <div className="w-[450px] h-[560px] bg-white grid items-center justify-items-center grid-rows-[40px_40px_1fr] gap-y-[15px]">
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
          onClick={() => setOpenProfileBox((prev) => !prev)}
        ></img>
      </header>
      <div
        ref={profileBox}
        className="w-30 h-0 z-10 bg-white shadow-lg rounded-md absolute right-1 top-13 transition-all duration-200 overflow-hidden flex flex-col items-center justify-start p-1 gap-y-3"
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
          <span className="font-semibold text-[13px] ml-2 cursor-pointer hover:text-[#295FA6]">
            My Profile
          </span>
        </div>
        <div className="w-full flex items-center justify-start">
          <img className="w-6 h-6" src={setting}></img>
          <span className="font-semibold text-[13px] ml-1 cursor-pointer hover:text-[#295FA6]">
            Setting
          </span>
        </div>
        <div className="w-full flex items-center justify-start">
          <img className="w-5 h-5" src={logoutIcon}></img>
          <span
            onClick={logout}
            className="font-semibold text-[13px] ml-2 cursor-pointer hover:text-[#295FA6]"
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
        <span className={`${isHome ? "text-[#295FA6]" : "text-gray-300"}`}>
          Home
        </span>
      </Link>
      <Link
        to={"/assistant"}
        className="w-11/12 h-[30px] border border-gray-300 rounded-md bg-white flex items-center justify-center font-semibold cursor-pointer"
      >
        <img className="h-4" src={isAssistant ? webBalck : webGray}></img>
        <span className={`${isAssistant ? "text-[#295FA6]" : "text-gray-300"}`}>
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
        <span className={`${isSchedule ? "text-[#295FA6]" : "text-gray-300"}`}>
          Schedule
        </span>
      </Link>
    </div>
  );
}
