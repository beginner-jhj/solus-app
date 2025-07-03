let selectedText = "";

document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
  
    const oldButton = document.getElementById("solus-ask-button");
    if (oldButton) oldButton.remove();
  
    if (selectedText.length === 0) return;
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
  
    const button = document.createElement("button");
    button.id = "solus-ask-button";
    button.textContent = "Ask Solus";
    button.style.position = "fixed";
    button.style.left = `${rect.right + 5}px`;
    button.style.top = `${rect.top + 10}px`;
    button.style.zIndex = 9999;
    button.style.padding = "4px 8px";
    button.style.fontSize = "12px";
    button.style.fontWeight = "600";
    button.style.background = "#fff";
    button.style.color = "#304F8C";
    button.style.borderRadius = "6px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    
    document.body.appendChild(button);

    console.log("selectedText", selectedText);
  });
  
  