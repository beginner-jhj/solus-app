import chatHistoryIcon from "../assets/talk-icon.svg";
import {ConversationContainer} from "../components/assistant/ConversationContainer";

export default function AssistantPage() {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start">
      <img src={chatHistoryIcon} className="w-4 h-4 cursor-pointer" />
      <ConversationContainer />
    </div>
  );
}
