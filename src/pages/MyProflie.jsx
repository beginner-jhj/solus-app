import { store } from "../store/store.js";
import { useEffect, useState } from "react";
import { fetchWithErrorHandling } from "../lib/lib.js";
import { checkAuth } from "../lib/lib.js";
import { useNavigate } from "react-router-dom";
import ErrorNotification from "../components/common/ErrorNotification.jsx";

export default function MyProfile() {
    const { profileImageURL } = store();
    const navigate = useNavigate();
    const [error, setError] = useState({ open: false, message: "" });

    useEffect(() => {
        const fetchProfileImage = async () => {
            const accessToken = await checkAuth();
            try {
                const data = await fetchWithErrorHandling("http://localhost:8000/user/get_profile", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }, setError, navigate);
                console.log("profile:",data);
            } catch (err) {
                console.error("Fetching profile image failed:", err);
                setError({ open: true, message: err.message });
            }
        };
        const fetchSurveyResult = async () => {
            const accessToken = await checkAuth();
            try {
                const data = await fetchWithErrorHandling("http://localhost:8000/user/get_survey_result", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }, setError, navigate);
                console.log("survey result:",data);
            } catch (err) {
                console.error("Fetching survey result failed:", err);
                setError({ open: true, message: err.message });
            }
        };

        const fetchAllEvents = async () => {
            const accessToken = await checkAuth();
            try {
                const data = await fetchWithErrorHandling("http://localhost:8000/schedule/get_events?getAll=true", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }, setError, navigate);
                console.log("all events:",data);
            } catch (err) {
                console.error("Fetching all events failed:", err);
                setError({ open: true, message: err.message });
            }
        };
        fetchProfileImage();
        fetchSurveyResult();
        fetchAllEvents();
    }, []);

    return (
        <div className="w-80 h-full flex flex-col items-center justify-start p-4">
            <img src={profileImageURL} alt="Profile" className="w-20 h-20 rounded-full border-0" />
            <ErrorNotification error={error} setError={setError} />
        </div>
    );
}