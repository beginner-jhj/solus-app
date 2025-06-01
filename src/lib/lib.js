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

// DB Constants
const DB_NAME = "chat_db";
const STORE_NAME = "conversations";
const DB_VERSION = 1;

// Generate Chat ID
export const generateChatId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Initialize DB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("summary", "summary", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    };
  });
};

// Save Conversation
export const saveConversation = (conversation) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(conversation);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Error saving conversation:", event.target.error);
        reject(event.target.error);
      };

      transaction.onabort = (event) => {
        console.error("Transaction aborted:", event.target.error);
        reject(event.target.error);
      };
    }).catch(reject);
  });
};

// Load Conversations
export const loadConversations = () => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll(); // Correctly use getAll()

      request.onsuccess = (event) => {
        const conversations = event.target.result; // This will be an array
        if (conversations) {
          resolve(conversations.map(conv => ({ id: conv.id, summary: conv.summary })));
        } else {
          resolve([]); // Should not happen with getAll unless store is empty
        }
      };

      request.onerror = (event) => {
        console.error("Error loading conversations:", event.target.error);
        reject(event.target.error);
      };

      transaction.onabort = (event) => { // Also good to handle onabort for readonly transactions
        console.error("Transaction aborted while loading conversations:", event.target.error);
        reject(event.target.error);
      };
    }).catch(reject);
  });
};

// Load Conversation History
export const loadConversationHistory = (id) => {
  if (typeof id === 'undefined' || id === null) {
    console.error("loadConversationHistory called with undefined or null id");
    return Promise.resolve([]); // Resolve with empty history
  }
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.history);
        } else {
          resolve([]); // Or null, depending on desired behavior for not found
        }
      };

      request.onerror = (event) => {
        console.error("Error loading conversation history:", event.target.error);
        reject(event.target.error);
      };
    }).catch(reject);
  });
};

// Delete Conversation
export const deleteConversation = (id) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting conversation:", event.target.error);
        reject(event.target.error);
      };

      transaction.onabort = (event) => {
        console.error("Transaction aborted during delete:", event.target.error);
        reject(event.target.error);
      };
    }).catch(reject);
  });
};