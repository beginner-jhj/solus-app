let selectedText = "";
let askButton = null;
let chatContainer = null;

function createAskButton(rect) {
  askButton = document.createElement("button");
  askButton.id = "solus-ask-button";
  askButton.textContent = "Ask Solus";
  askButton.style.position = "fixed";
  askButton.style.left = `${rect.right + 10}px`;
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
  askButton.addEventListener("click", () => handleAskClick(rect));
  document.body.appendChild(askButton);
}

function removeAskButton() {
  if (askButton) {
    askButton.removeEventListener("click", handleAskClick);
    askButton.remove();
    askButton = null;
  }
}

function createChatUI(rect) {
  chatContainer = document.createElement("div");
  chatContainer.id = "solus-chat-container";
  chatContainer.style.position = "fixed";
  // Position initially just below/right of the selection
  chatContainer.style.top = `${rect.bottom}px`;
  chatContainer.style.left = `${rect.right}px`;
  chatContainer.style.width = "350px";
  chatContainer.style.height = "420px";
  chatContainer.style.maxHeight = "450px";
  chatContainer.style.background = "#fff";
  chatContainer.style.border = "1px solid #ccc";
  chatContainer.style.borderRadius = "6px";
  chatContainer.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  chatContainer.style.zIndex = 9999;
  chatContainer.style.display = "flex";
  chatContainer.style.flexDirection = "column";
  chatContainer.style.alignItems="center";
  chatContainer.style.fontSize = "12px";
  chatContainer.style.cursor = "pointer";

  const selectedElem = document.createElement("div");
  selectedElem.style.width = "inherit";
  selectedElem.style.height = "30px";
  selectedElem.textContent = selectedText;
  selectedElem.style.background = "#f0f4ff";
  selectedElem.style.padding = "6px";
  selectedElem.style.fontWeight = "600";
  selectedElem.style.fontSize = "11px";
  selectedElem.style.borderRadius = "4px";
  selectedElem.style.marginBottom = "6px";
  selectedElem.style.maxHeight = "60px";
  selectedElem.style.overflow = "hidden";
  selectedElem.style.textOverflow = "ellipsis";
  selectedElem.style.whiteSpace = "nowrap";

  const messagesElem = document.createElement("div");
  messagesElem.id = "solus-chat-messages";
  messagesElem.style.height = "320px";
  messagesElem.style.width = "inherit";
  messagesElem.style.overflow = "auto";
  messagesElem.style.padding = "8px";
  messagesElem.style.flex = "1";
  messagesElem.style.overflowY = "auto";
  messagesElem.style.wordBreak = "break-word";
  messagesElem.style.whiteSpace = "pre-wrap";

  // footer container to hold selected text & input
  const footerElem = document.createElement("div");
  footerElem.style.width = "inherit";
  footerElem.style.height = "100px";
  footerElem.style.borderTop = "1px solid #e5e5e5";
  footerElem.style.padding = "8px";
  footerElem.style.display = "flex";
  footerElem.style.flexDirection = "column";
  footerElem.style.alignItems="center";

  const inputElem = document.createElement("textarea");
  inputElem.style.width = "inherit";
  inputElem.id = "solus-chat-input";
  inputElem.placeholder = "Type your question...";
  inputElem.style.resize = "none";
  inputElem.style.height = "60px";
  inputElem.style.padding = "6px";
  inputElem.style.border = "1px solid #ccc";
  inputElem.style.borderRadius = "4px";
  inputElem.style.borderTop = "1px solid #e5e5e5";

  chatContainer.appendChild(messagesElem);

  footerElem.appendChild(selectedElem);
  footerElem.appendChild(inputElem);
  chatContainer.appendChild(footerElem);

  document.body.appendChild(chatContainer);

  // Make the chat UI draggable
  makeDraggable(chatContainer);

  inputElem.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(inputElem.value, messagesElem);
      inputElem.value = "";
    }
  });
}

// Helper to make an element draggable within the viewport
function makeDraggable(elem) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  const onMouseDown = (e) => {
    // Don't start dragging when interacting with the textarea (or any input element inside)
    if (e.target.closest("textarea, input")) return;

    isDragging = true;
    const rect = elem.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    // switch to top/left positioning to allow free movement
    elem.style.right = "auto";
    elem.style.bottom = "auto";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    // Keep within viewport bounds
    const maxLeft = window.innerWidth - elem.offsetWidth;
    const maxTop = window.innerHeight - elem.offsetHeight;
    newLeft = Math.max(0, Math.min(maxLeft, newLeft));
    newTop = Math.max(0, Math.min(maxTop, newTop));

    elem.style.left = `${newLeft}px`;
    elem.style.top = `${newTop}px`;
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  elem.addEventListener("mousedown", onMouseDown);
}

function removeChatUI() {
  if (chatContainer) {
    chatContainer.remove();
    chatContainer = null;
  }
}

function handleAskClick(rect) {
  removeChatUI();
  createChatUI(rect);
}

function sendQuestion(question, messagesElem) {
  if (!question.trim()) return;
  const loading = document.createElement("span");
  loading.textContent = "Loading...";
  messagesElem.appendChild(loading);
  chrome.runtime.sendMessage(
    { type: "ASK_WEB_Q", selectedText, userQuestion: question },
    (response) => {
      console.log("Response:", response);
      loading.remove();
      if (response && response.data) {
        const answer = document.createElement("div");
        answer.style.height = "60px";
        answer.style.width = "inherit";
        answer.style.overflow = "auto";
        answer.style.margin = "4px 0";
        answer.style.background = "#f9f9f9";
        answer.style.padding = "4px";
        answer.style.borderRadius = "4px";

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

document.addEventListener("mouseup", (e) => {
  if(e.target && e.target.id === "solus-ask-button") return;
  const selection = window.getSelection();
  selectedText = selection.toString().trim();
  removeAskButton();
  if (selectedText.length === 0) return;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  createAskButton(rect);
});

