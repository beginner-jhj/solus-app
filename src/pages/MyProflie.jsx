import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../store/store.js";
import { fetchWithErrorHandling, checkAuth } from "../lib/lib.js";
import ErrorNotification from "../components/common/ErrorNotification.jsx";
import editIconGray from "../assets/pencil-gray.svg";
import editIconBlack from "../assets/pencil-black.svg";

export default function MyProfile() {
  const { profileImageURL, setProfileImageURL } = store();
  const navigate = useNavigate();
  const [error, setError] = useState({ open: false, message: "" });
  const [profile, setProfile] = useState({ name: "", createdAt: "", profileImage: "" });
  const [survey, setSurvey] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = await checkAuth(navigate);
      if (!accessToken) return;
      try {
        const data = await fetchWithErrorHandling(
          "http://localhost:8000/user/get_profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          setError,
          navigate
        );
        setProfile({
          name: data.name,
          createdAt: data.createdAt,
          profileImage: data.profileImage,
        });
        if (data.profileImage) setProfileImageURL(data.profileImage);
      } catch (err) {
        console.error("Fetching profile failed:", err);
      }
    };

    const fetchSurveyResult = async () => {
      const accessToken = await checkAuth(navigate);
      if (!accessToken) return;
      try {
        const data = await fetchWithErrorHandling(
          "http://localhost:8000/user/get_survey_result",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          setError,
          navigate
        );
        setSurvey(data.surveyResult ? data.surveyResult[0] : null);
      } catch (err) {
        console.error("Fetching survey result failed:", err);
      }
    };

    const fetchAllEvents = async () => {
      const accessToken = await checkAuth(navigate);
      if (!accessToken) return;
      try {
        const data = await fetchWithErrorHandling(
          "http://localhost:8000/schedule/get_events?getAll=true",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          setError,
          navigate
        );
        const events = data.data || [];
        const completed = events.filter((ev) => ev.complete).length;
        const ratio = events.length > 0 ? Math.round((completed / events.length) * 100) : 0;
        setPercentage(ratio);
      } catch (err) {
        console.error("Fetching all events failed:", err);
      }
    };

    fetchProfile();
    fetchSurveyResult();
    fetchAllEvents();
  }, [navigate, setProfileImageURL]);

  return (
    <div className="w-80 h-full flex flex-col items-start justify-start p-4 gap-y-4 overflow-y-auto">
      <ErrorNotification open={error.open} message={error.message} onClose={() => setError({ open: false, message: "" })} />
      <div className="w-full flex flex-col items-center gap-y-1">
        <img src={profile.profileImage || profileImageURL} alt="Profile" className="w-20 h-20 rounded-full border" />
        <span className="font-semibold text-base">{profile.name}</span>
        {profile.createdAt && (
          <span className="text-xs text-gray-500">Joined {new Date(profile.createdAt).toISOString().split("T")[0]}</span>
        )}
      </div>
      {survey && (
        <div className="w-full flex flex-col gap-y-2">
          {Object.entries(survey).map(([key, value], index) => (
            <div
              key={key}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 flex items-start justify-between"
            >
              <div className="flex flex-col text-[13px]">
                <span className="font-semibold text-gray-700 capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-gray-600 whitespace-pre-line">{value}</span>
              </div>
              <img
                src={hoverIndex === index ? editIconBlack : editIconGray}
                alt="Edit"
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
      <div className="w-full flex flex-col gap-y-1">
        <span className="font-semibold text-sm">Schedule Progress</span>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="text-xs text-gray-600 font-semibold">{percentage}% complete</span>
      </div>
    </div>
  );
}
