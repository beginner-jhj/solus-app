let selectedText = "";
let askButton = null;
let chatContainer = null;

function createAskButton(rect) {
  askButton = document.createElement("button");
  askButton.id = "solus-ask-button";
  askButton.textContent = "Ask Solus";
  askButton.style.position = "fixed";
  askButton.style.left = `${rect.right + 5}px`;
  askButton.style.top = `${rect.top + 10}px`;
  askButton.style.zIndex = 9999;
  askButton.style.padding = "4px 8px";
  askButton.style.fontSize = "12px";
  askButton.style.fontWeight = "600";
  askButton.style.background = "#fff";
  askButton.style.color = "#304F8C";
  askButton.style.borderRadius = "6px";
  askButton.style.cursor = "pointer";
  askButton.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  askButton.addEventListener("click", handleAskClick);
  document.body.appendChild(askButton);
}

function removeAskButton() {
  if (askButton) {
    askButton.removeEventListener("click", handleAskClick);
    askButton.remove();
    askButton = null;
  }
}

function createChatUI() {
  chatContainer = document.createElement("div");
  chatContainer.id = "solus-chat-container";
  chatContainer.style.position = "fixed";
  chatContainer.style.bottom = "20px";
  chatContainer.style.right = "20px";
  chatContainer.style.width = "300px";
  chatContainer.style.maxHeight = "400px";
  chatContainer.style.background = "#fff";
  chatContainer.style.border = "1px solid #ccc";
  chatContainer.style.borderRadius = "6px";
  chatContainer.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  chatContainer.style.zIndex = 9999;
  chatContainer.style.display = "flex";
  chatContainer.style.flexDirection = "column";
  chatContainer.style.fontSize = "12px";

  const selectedElem = document.createElement("div");
  selectedElem.textContent = selectedText;
  selectedElem.style.background = "#f5f5f5";
  selectedElem.style.padding = "8px";
  selectedElem.style.borderBottom = "1px solid #e5e5e5";
  selectedElem.style.fontWeight = "bold";

  const messagesElem = document.createElement("div");
  messagesElem.id = "solus-chat-messages";
  messagesElem.style.padding = "8px";
  messagesElem.style.flex = "1";
  messagesElem.style.overflowY = "auto";

  const inputElem = document.createElement("textarea");
  inputElem.id = "solus-chat-input";
  inputElem.style.resize = "none";
  inputElem.style.height = "40px";
  inputElem.style.padding = "4px";
  inputElem.style.borderTop = "1px solid #e5e5e5";

  chatContainer.appendChild(selectedElem);
  chatContainer.appendChild(messagesElem);
  chatContainer.appendChild(inputElem);

  document.body.appendChild(chatContainer);

  inputElem.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(inputElem.value, messagesElem);
      inputElem.value = "";
    }
  });
}

function removeChatUI() {
  if (chatContainer) {
    chatContainer.remove();
    chatContainer = null;
  }
}

function handleAskClick() {
  removeAskButton();
  removeChatUI();
  createChatUI();
}

function sendQuestion(question, messagesElem) {
  if (!question.trim()) return;
  const loading = document.createElement("div");
  loading.textContent = "Loading...";
  messagesElem.appendChild(loading);
  chrome.runtime.sendMessage(
    { type: "ASK_WEB_Q", selectedText, userQuestion: question },
    (response) => {
      loading.remove();
      if (response && response.data) {
        const answer = document.createElement("div");
        answer.textContent = response.data;
        messagesElem.appendChild(answer);
      } else {
        const err = document.createElement("div");
        err.textContent = "Failed to get response";
        messagesElem.appendChild(err);
      }
    }
  );
}

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  selectedText = selection.toString().trim();
  removeAskButton();
  if (selectedText.length === 0) return;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  createAskButton(rect);
});

