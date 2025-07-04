import { Greeting } from "./Greeting";
import { Chat } from "./Chat";
import { assistantPageStore } from "./assistantPageStore";
import { UserMessage } from "./messages/UserMessage";
import { AssistantMessage } from "./messages/AssistantMessage";
import { useEffect, useRef } from "react";

export function ConversationContainer() {
  const { 
    chatHistory, 
    isLoading, 
    isChatStarting,
    currentConversationId,
    loadConversations
  } = assistantPageStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when chat history changes
  useEffect(scrollToBottom, [chatHistory]);
  
  // Reload conversations when a message is sent or received
  useEffect(() => {
    if (chatHistory.length > 0) {
      loadConversations();
    }
  }, [chatHistory.length, loadConversations]);

  // Dynamically calculate available height for messages
  // This is a rough estimation. For perfect accuracy, one might need to use ResizeObserver
  // or get actual heights of Greeting and Chat components.
  // Assuming Greeting is roughly 20% of initial view, Chat input is roughly 15%.
  // When chat starts, Greeting becomes smaller.
  const greetingAreaHeightClass = isChatStarting ? "h-[30px]" : "h-[120px]"; // Fixed heights for more predictability

  return (
    <div className="w-full h-full relative flex flex-col bg-slate-50">
      <div className={`${greetingAreaHeightClass} transition-height duration-500 ease-in-out`}>
        <Greeting />
      </div>

      <div
        className="flex-grow overflow-y-auto p-3 w-full"
        // Calculate max height for the message container area
        // Subtracting the heights of Greeting and Chat input area
        // style={{ maxHeight: `calc(100% - ${isChatStarting ? '60px' : '120px'} - 80px)` }}
        // Using fixed pixel values for maxHeight calculation for better control in extension context
        style={{ height: `calc(100% - ${isChatStarting ? '60px' : '120px'} - 80px - 2rem)`}} // 2rem for padding of this container
      >
        {chatHistory.map((msg, index) => {
          if (msg.type === 'user') {
            return <UserMessage key={index} message={msg} />;
          } else if (msg.type === 'assistant') {
            return <AssistantMessage key={index} message={msg} />;
          }
          return null;
        })}
        <div ref={messagesEndRef} className="h-1" /> {/* Small height to ensure it's a valid scroll target */}
      </div>

      {isLoading && (
        <div className="px-4 py-2 text-center text-xs text-slate-500 animate-pulse">
          I'm thinking...
        </div>
      )}

      <div className="h-[60px] bg-slate-100 border-t border-slate-200">
        <Chat />
      </div>
    </div>
  );
}