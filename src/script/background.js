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
    });
    sendResponse({ success: true });
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
    });
    return true;
  }

  if (message.type === "REMOVE_ACCESS_TOKEN") {
    chrome.cookies.remove(
      {
        url: "http://localhost:8000/auth/check_token",
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
        url: "http://localhost:8000/auth/check_token",
        name: "refreshToken",
      },
      (cookie) => console.log("refreshToken deleted", cookie)
    );
    sendResponse({ success: true });
    return true;
  }

});
