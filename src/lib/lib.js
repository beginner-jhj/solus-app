/**
 * Utility function to handle fetch requests with consistent error handling
 * 
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @param {Function} setError - Function to set error state for UI notification
 * @param {Function} navigate - React Router navigate function (optional)
 * @param {boolean} redirectOnAuthError - Whether to redirect to signin on auth errors
 * @returns {Promise<Object>} - The response data
 */
export const fetchWithErrorHandling = async (url, options = {}, setError, navigate = null, redirectOnAuthError = true) => {
  try {
    const response = await fetch(url, options);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Parse the response based on content type
    const data = isJson ? await response.json() : await response.text();
    
    // Handle unsuccessful responses
    if (!response.ok) {
      const errorMessage = isJson && data.message 
        ? data.message 
        : `Error: ${response.status} ${response.statusText}`;
      
      // Handle authentication errors
      if (response.status === 401 && redirectOnAuthError && navigate) {
        navigate('/signin');
      }
      
      // Show error notification if setError function is provided
      if (setError) {
        setError({
          open: true,
          message: errorMessage
        });
      }
      
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Show error notification if setError function is provided
    if (setError) {
      setError({
        open: true,
        message: error.message || 'Network error occurred'
      });
    }
    
    // Handle authentication errors that might be caught here
    if (error.message.includes('Session expired') && redirectOnAuthError && navigate) {
      navigate('/signin');
    }
    
    throw error;
  }
};

export const checkAuth = async (navigate) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        navigate("/signin");
        return null;
      }

      const response = await fetch("https://solus-server-production.up.railway.app/auth/check_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
      const jsonRes = await response.json();

      if (response.status !== 200) {
        throw new Error("Session expired.");
      }

      if (jsonRes.expiredToken) {
        const newAccessToken = jsonRes.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        return newAccessToken;
      }
      return jsonRes.accessToken;
    } catch (err) {
      console.error(err);
      navigate("/signin");
      return null;
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

// ✅ DB 열기
export const openIndexedDB = (dbName, version, upgradeCallback) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = function(event) {
      upgradeCallback?.(event.target.result);
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
};

// ✅ 데이터 추가 (Create)
export const addDataToIndexedDB = (db, storeName, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    transaction.oncomplete = function() {
      resolve(data);
    };

    transaction.onerror = function(event) {
      console.error("Error adding data:", event.target.error);
      reject(event.target.error);
    };
  });
};

// ✅ 전체 데이터 가져오기 (Read All)
export const getDataFromIndexedDB = (db, storeName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("Error retrieving data:", event.target.error);
      reject(event.target.error);
    };
  });
};

// ✅ 특정 데이터 가져오기 (Read by Key)
export const getDataByKeyFromIndexedDB = (db, storeName, key) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      console.error("Error retrieving data by key:", event.target.error);
      reject(event.target.error);
    };
  });
};

// ✅ 데이터 업데이트 (Update) → store.put(data)
export const updateDataToIndexedDB = (db, storeName, key,data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const getData = store.get(key);
    
    getData.onsuccess = function(event) {
      const updatedData = {
        ...event.target.result,
        ...data
      };
      store.put(updatedData);
    };

    transaction.oncomplete = function() {
      resolve(data);
    };

    transaction.onerror = function(event) {
      console.error("Error updating data:", event.target.error);
      reject(event.target.error);
    };
  });
};

// ✅ 데이터 삭제 (Delete)
export const deleteDataFromIndexedDB = (db, storeName, key) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(key);

    transaction.oncomplete = function() {
      resolve(key);
    };

    transaction.onerror = function(event) {
      console.error("Error deleting data:", event.target.error);
      reject(event.target.error);
    };
  });
};

