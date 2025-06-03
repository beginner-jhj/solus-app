import logo from "../assets/logo.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { openIndexedDB } from "../lib/lib";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function SigninForm() {
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const handleLogin = () => {
    chrome.identity.launchWebAuthFlow(
      {
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org&scope=profile%20email`,
        interactive: true,
      },
      (redirectUrl) => {
        if (
          chrome.runtime.lastError ||
          !redirectUrl ||
          redirectUrl.includes("error=")
        ) {
          console.error("Login failed", chrome.runtime.lastError);
        } else {
          const accessToken = new URL(redirectUrl).hash.match(
            /access_token=([^&]+)/
          )?.[1];
          fetch("http://localhost:8000/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken }),
          })
            .then((res) => res.json())
            .then(async (jsonRes) => {
              const { accessToken, refreshToken } = jsonRes;
              
              // Use Promise.all to wait for both token operations to complete
              const setTokensPromise = Promise.all([
                new Promise((resolve) => {
                  chrome.runtime.sendMessage(
                    {
                      type: "SET_ACCESS_TOKEN",
                      token: accessToken,
                    },
                    (response) => {
                      resolve(response);
                    }
                  );
                }),
                new Promise((resolve) => {
                  chrome.runtime.sendMessage(
                    {
                      type: "SET_REFRESH_TOKEN",
                      token: refreshToken,
                    },
                    (response) => {
                      resolve(response);
                    }
                  );
                })
              ]);
              
              // Wait for both tokens to be set before navigating
              setTokensPromise.then(() => {
                setLoginSuccess(true);
                
                if (!localStorage.getItem("nickname")) {
                  navigate("/survey");
                } else {
                  navigate("/");
                }
              }).catch(error => {
                console.error("Error setting tokens:", error);
              });
            })
            .catch((err) => {
              console.error(err);
            });
        }
      }
    );
  };

  useEffect(()=>{
    const createDB = async () => {
      try {
        const db = await openIndexedDB("chat", 1, (db) => {
          if(db.objectStoreNames.contains("messages")){
            return;
          }
         const messagesStore = db.createObjectStore("messages", { keyPath: "id" , autoIncrement: true});
         messagesStore.createIndex("conversationId", "conversationId", { unique: false });
         messagesStore.createIndex("timestamp", "timestamp", { unique: false });
        });
      } catch (error) {
        console.error("Error creating IndexedDB:", error);
      }
    }
    if(loginSuccess){
      createDB();
    }
  },[loginSuccess])



  return (
    <div className="w-80 h-60 flex flex-col items-center justify-center relative p-6">
      <img src={logo} className="w-8 h-8 absolute top-4 left-4" />
      <h1 className="text-2xl font-bold mt-2">Solus</h1>
      <p className="text-sm text-gray-600 mb-6">Your Day, Smarter.</p>
      <button
        type="button"
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:shadow-md transition bg-white cursor-pointer"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google Logo"
          className="w-5 h-5"
        />
        <span className="text-sm text-gray-700 font-medium">
          Sign in with Google
        </span>
      </button>
    </div>
  );
}
