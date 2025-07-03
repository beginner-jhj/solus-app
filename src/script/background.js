chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_ACCESS_TOKEN") {
    chrome.cookies.set({
      url: "http://localhost:8000/auth/login",
      name: "accessToken",
      value: message.token,
      secure: true,
      httpOnly: true,
      sameSite: "no_restriction",
      expirationDate: Math.floor(Date.now() / 1000) + 60 * 60,
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "SET_REFRESH_TOKEN") {
    chrome.cookies.set({
      url: "http://localhost:8000/auth/login",
      name: "refreshToken",
      value: message.token,
      secure: true,
      httpOnly: true,
      sameSite: "no_restriction",
      expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "REMOVE_ACCESS_TOKEN") {
    chrome.cookies.remove(
      {
        url: "http://localhost:8000/auth/login",
        name: "accessToken",
      },
      (cookie) => console.log("accessToken deleted", cookie)
    );
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "REMOVE_REFRESH_TOKEN") {
    chrome.cookies.remove(
      {
        url: "http://localhost:8000/auth/login",
        name: "refreshToken",
      },
      (cookie) => console.log("refreshToken deleted", cookie)
    );
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "ASK_WEB_Q") {
    chrome.cookies.get({ url: "http://localhost:8000/auth/login", name: "accessToken" }, async (cookie) => {
      try {
        const token = cookie ? cookie.value : "";
        const response = await fetch("http://localhost:8000/assistant/ask_web_q", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ selectedText: message.selectedText, userQuestion: message.userQuestion }),
        });
        if (!response.ok) {
          const text = await response.text();             // read body once
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const data = await response.json();
        sendResponse({ data: data.data.searchResult });
      } catch (err) {
        console.error("ASK_WEB_Q error", err); // endpoint returns 404 if path incorrect
        sendResponse({ error: true, message: err.message || String(err), stack: err.stack });
      }
    });
    return true;
  }

  if(message.type === "OPEN_URL") {
    console.log("OPEN_URL", message.url);
    chrome.tabs.create({ url: message.url });
    sendResponse({ success: true });
    return true;
  }
});

