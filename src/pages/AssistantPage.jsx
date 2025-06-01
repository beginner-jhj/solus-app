<<<<<<< HEAD
import chatHistoryIcon from "../assets/talk-icon.svg";
import {ConversationContainer} from "../components/assistant/ConversationContainer";
=======
import { useState, useEffect, useRef } from "react";
import { assistantPageStore } from "../components/assistant/assistantPageStore";
import talkIcon from "../assets/talk-icon.svg";
import { ConversationContainer } from "../components/assistant/ConversationContainer";
>>>>>>> 14453ff2bebeb16012e0d9b7c20dfa0a03b40cc2

export default function AssistantPage() {
  const { conversationSummaries, currentChatId } = assistantPageStore(state => ({
    conversationSummaries: state.conversationSummaries,
    currentChatId: state.currentChatId,
  }));
  const { initStore, switchConversation, createNewChat } = assistantPageStore.getState();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    initStore().catch(console.error); // Initialize store on component mount
  }, [initStore]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, iconRef]); // Removed setIsDropdownOpen from deps as it's a setter

  return (
<<<<<<< HEAD
    <div className="w-full h-full flex flex-col items-start justify-start">
      <img src={chatHistoryIcon} className="w-4 h-4 cursor-pointer" />
=======
    <div className="w-full h-full flex flex-col items-start justify-start p-4"> {/* Added some padding */}
      <div className="relative mb-4"> {/* Container for icon and dropdown, added margin bottom */}
        <img
          ref={iconRef}
          src={talkIcon}
          className="w-6 h-6 cursor-pointer" // Adjusted size
          alt="Chat History"
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(prev => !prev);
          }}
        />
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-300 rounded-lg shadow-xl z-20 py-1"
          >
            <div
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-200"
              onClick={() => {
                createNewChat();
                setIsDropdownOpen(false);
              }}
            >
              + Create new chat
            </div>
            <div className="max-h-60 overflow-y-auto"> {/* Add custom-scrollbar if you have it */}
              {!conversationSummaries || conversationSummaries.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">No past chats.</p>
              ) : (
                conversationSummaries.map((conv) => (
                  <div
                    key={conv.id}
                    className={`px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer truncate ${
                      conv.id === currentChatId ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                    }`}
                    onClick={() => {
                      switchConversation(conv.id);
                      setIsDropdownOpen(false);
                    }}
                    title={conv.summary}
                  >
                    {conv.summary || "Untitled Chat"}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
>>>>>>> 14453ff2bebeb16012e0d9b7c20dfa0a03b40cc2
      <ConversationContainer />
    </div>
  );
}
