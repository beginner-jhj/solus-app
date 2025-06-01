export const checkAuth = async (navigate) => {
    try {
      const response = await fetch("http://localhost:8000/auth/check_token", {
        method: "POST",
        credentials: "include",
      });
      const jsonRes = await response.json();

      if (response.status !== 200) {
        throw new Error("Session expired.");
      }

      if (response.status === 200 && jsonRes.expiredToken) {
        const newAccessToken = jsonRes.accessToken;
        chrome.runtime.sendMessage({
          type: "SET_ACCESS_TOKEN",
          token: newAccessToken,
        });
        return newAccessToken;
      }
      return jsonRes.accessToken;
    } catch (err) {
      console.error(err);
      navigate("/signin");
      return
    }
  };

export const getLocation = ()=>{
  return new Promise((resolve, reject)=>{
    navigator.geolocation.getCurrentPosition((position)=>{
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },(error)=>{
      reject(error)
    })
  })
}