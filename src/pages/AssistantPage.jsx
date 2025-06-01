import { useEffect } from "react"; // Removed useState, useRef, shallow
import { assistantPageStore } from "../components/assistant/assistantPageStore";
import talkIcon from "../assets/talk-icon.svg";
import { ConversationContainer } from "../components/assistant/ConversationContainer";

export default function AssistantPage() {
  // Removed store subscription for conversationSummaries and currentChatId
  // const { conversationSummaries, currentChatId } = assistantPageStore( ... );

  // Still need initStore if it's responsible for setting initial isLoading states.
  // switchConversation and createNewChat are removed from the store, so no need to get them.
  const { initStore } = assistantPageStore.getState();

  // Removed state variables for dropdown
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const dropdownRef = useRef(null);
  // const iconRef = useRef(null);

  useEffect(() => {
    // initStore is now very simple, e.g., set({isLoading: false})
    // Keeping this if AssistantPage or its children depend on isLoading being managed.
    initStore().catch(console.error);
  }, [initStore]); // initStore from getState() is stable

  // Removed useEffect for click-outside listener

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-4">
      <div className="relative mb-4">
        <img
          // ref removed
          src={talkIcon}
          className="w-6 h-6" // cursor-pointer and onClick removed
          alt="Chat History Icon (disabled)" // Alt text updated
          // onClick handler removed
        />
        {/* Dropdown JSX removed */}
      </div>
      <ConversationContainer />
    </div>
  );
}
