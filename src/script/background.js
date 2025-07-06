chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_ACCESS_TOKEN") {
    chrome.cookies.set({
      url: "https://solus-server-production.up.railway.app/auth/login",
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
      url: "https://solus-server-production.up.railway.app/auth/login",
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
        url: "https://solus-server-production.up.railway.app/auth/login",
        name: "accessToken",
      },
      (cookie) => console.log("accessToken deleted")
    );
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "REMOVE_REFRESH_TOKEN") {
    chrome.cookies.remove(
      {
        url: "https://solus-server-production.up.railway.app/auth/login",
        name: "refreshToken",
      },
      (cookie) => console.log("refreshToken deleted")
    );
    sendResponse({ success: true });
    return true;
  }

  if(message.type === "OPEN_URL") {
    chrome.tabs.create({ url: message.url });
    sendResponse({ success: true });
    return true;
  }
});

