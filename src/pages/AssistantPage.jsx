import convIcon from "../assets/talk-icon.svg";
import { ConversationContainer } from "../components/assistant/ConversationContainer";
import { assistantPageStore } from "../components/assistant/assistantPageStore";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

export default function AssistantPage() {
  const { 
    toggleConversationList, 
    showConversationList, 
    conversations, 
    loadConversations, 
    switchConversation,
    createNewConversation,
    deleteConversation,
    currentConversationId,
    setIsChatStarting
  } = assistantPageStore();
  
  // State for delete confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    conversationId: null,
    title: '',
    message: ''
  });
  
  // State for tracking deletion in progress
  const [deletingConversationId, setDeletingConversationId] = useState(null);

  // Load conversations when component mounts
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  
  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (e, conversationId, title) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      conversationId,
      title: 'Delete Conversation',
      message: `Are you sure you want to delete "${title || 'this conversation'}"? This action cannot be undone.`
    });
  };
  
  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    const { conversationId } = confirmDialog;
    setDeletingConversationId(conversationId);
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    
    try {
      await deleteConversation(conversationId);
    } finally {
      setDeletingConversationId(null);
    }
  };
  
  // Handle canceling deletion
  const handleCancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-4">
      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      
      <div className="relative mb-4">
        <img
          src={convIcon}
          className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
          alt="Chat History Icon"
          onClick={toggleConversationList}
        />
        
        {/* Conversation list dropdown */}
        {showConversationList && (
          <div className="absolute top-8 left-0 w-64 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Conversations</h3>
              <button 
                onClick={createNewConversation}
                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                title="New Conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">No conversations yet</div>
              ) : (
                conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`p-2 hover:bg-gray-50 ${conv.id === currentConversationId ? 'bg-blue-50' : ''} relative group`}
                  >
                    <div 
                      className="cursor-pointer pr-6"
                      onClick={() => {
                        setIsChatStarting(true);
                        switchConversation(conv.id)
                      }}
                    >
                      <div className="text-sm font-medium text-gray-800 truncate">{conv.title}</div>
                      <div className="text-xs text-gray-500 flex justify-between mt-1">
                        <span>{conv.messageCount} messages</span>
                        <span>{formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => handleDeleteClick(e, conv.id, conv.title)}
                      title="Delete conversation"
                      disabled={deletingConversationId === conv.id}
                    >
                      {deletingConversationId === conv.id ? (
                        <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <ConversationContainer />
    </div>
  );
}
