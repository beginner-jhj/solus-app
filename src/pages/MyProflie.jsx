import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../store/store.js";
import { fetchWithErrorHandling, checkAuth } from "../lib/lib.js";
import ErrorNotification from "../components/common/ErrorNotification.jsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import editIconGray from "../assets/pencil-gray.svg";
import editIconBlack from "../assets/pencil-black.svg";
import deleteIcon from "../assets/delete.svg";

export default function MyProfile() {
  const { profileImageURL, setProfileImageURL } = store();
  const navigate = useNavigate();
  const [error, setError] = useState({ open: false, message: "" });
  const [profile, setProfile] = useState({ name: "", createdAt: "", profileImage: "" });
  const [survey, setSurvey] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {

    fetchProfile();
    fetchSurveyResult();
    fetchAllEvents();
  }, [navigate, setProfileImageURL]);

  const deleteAccount = async () => {
    setIsLoading(true);
    const accessToken = await checkAuth(navigate);
    if (!accessToken) return;
    try {
      const data = await fetchWithErrorHandling(
        "https://solus-server-production.up.railway.app/user/delete_account",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        setError,
        navigate
      );
      if(data.success){
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.clear();
        navigate("/signin");
      }
    } catch (err) {
      console.error("Deleting user failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const editSurvey = (surveyKey, surveyValue) => {
    setSurvey((prev) => ({
      ...prev,
      [surveyKey]: surveyValue,
    }));
  }

  const saveUpdatedProfileInfo = async () => {
    const accessToken = await checkAuth(navigate);
    if (!accessToken) return;
    try {
      const data = await fetchWithErrorHandling(
        "https://solus-server-production.up.railway.app/user/update_user_profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(survey),
        },
        setError,
        navigate
      );
      if(!data.success){
        throw new Error(data.message);
      }

      if(data.success){
        await fetchSurveyResult();
      }
    } catch (err) {
      console.error("Updating user failed:", err);
    }
  }

  return (
    <div className="w-80 h-full flex flex-col items-center justify-start p-4 gap-y-4 overflow-y-auto relative">
      <ErrorNotification open={error.open} message={error.message} onClose={() => setError({ open: false, message: "" })} />
      {isLoading && <LoadingOverlay />}
      <span className="font-semibold text-xs text-gray-500 cursor-pointer absolute top-4 left-4 z-10" onClick={() => navigate("/")}>Go back</span>
      <div className="w-full flex flex-col items-center gap-y-1 top-4">
        <img src={profile.profileImage || profileImageURL} alt="Profile" className="w-20 h-20 rounded-full border-0" />
        <span className="font-semibold text-base">{profile.name}</span>
        {profile.createdAt && (
          <span className="text-xs text-gray-500">Joined {new Date(profile.createdAt).toISOString().split("T")[0]}</span>
        )}
      </div>
      {survey && Object.entries(survey).length > 0 && (
        <div className="w-full flex flex-col gap-y-2">
          {Object.entries(survey).map((item) => <ProfileItem surveyKey={item[0]} survey={survey} editProfileInfo={editSurvey} saveUpdatedProfileInfo={saveUpdatedProfileInfo} />)}
        </div>
      )}
      <div className="w-full flex flex-col gap-y-1">
        <span className="font-semibold text-sm">Schedule Progress</span>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="text-xs text-gray-600 font-semibold">{percentage}% complete</span>
      </div>
      <div className="w-full flex items-center justify-end gap-x-1 mt-2">
        <img src={deleteIcon} alt="Delete" className="w-4 h-4 cursor-pointer" onClick={() => setIsDeleteConfirmOpen(true)} />
        <span className="text-xs text-gray-600 font-semibold cursor-pointer hover:text-red-600" onClick={() => setIsDeleteConfirmOpen(true)}>Delete Account</span>
      </div>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        onConfirm={deleteAccount}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
}

function ProfileItem({surveyKey, survey,editProfileInfo, saveUpdatedProfileInfo}) {
  const [showEditProfile, setShowEditProfile] = useState(false);

  return(
    <div
      key={surveyKey}
      className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 flex items-start justify-between"
    >
      <div className="flex flex-col text-[13px]">
        <span className="font-semibold text-gray-700 capitalize">{surveyKey?.replace(/_/g, " ")}</span>
        {!showEditProfile && <span className="text-gray-600 whitespace-pre-line">{survey[surveyKey]}</span>}
        {showEditProfile && (
          <textarea
            value={survey[surveyKey]}
            onInput={(e) => {editProfileInfo(surveyKey, e.target.value)}}
            className="w-[200px] border border-gray-200 focus:outline-none rounded-md p-1"
          />
        )}
      </div>
      {!showEditProfile && <img
        src={editIconGray}
        onClick={() => setShowEditProfile(true)}
        alt="Edit"
        className="w-4 h-4 cursor-pointer"
      />}
      {showEditProfile && <img
        src={editIconBlack}
        onClick={() => {saveUpdatedProfileInfo(); setShowEditProfile(false);}}
        alt="Edit"
        className="w-4 h-4 cursor-pointer"
      />}
    </div>
  )
}