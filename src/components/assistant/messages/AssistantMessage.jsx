export function AssistantMessage({ message }) {
  let responseToRender = "Assistant is processing..."; // Default fallback

  if (message.data && message.data.response) {
    if (typeof message.data.response === 'string') {
      responseToRender = message.data.response;
    } else if (typeof message.data.response === 'object' && message.data.response.response) {
      // If message.data.response is an object, and it has a 'response' key
      responseToRender = message.data.response.response;
    } else if (typeof message.data.response === 'object') {
      // Fallback for object without a .response key: stringify for debugging or show generic error
      console.error("AssistantMessage: message.data.response is an object but lacks a .response key:", message.data.response);
      responseToRender = "Received a complex response object. Please check console for details.";
    }
    // If message.data.response was something else (e.g. number, boolean), it will keep "Assistant is processing..." or be caught by string check.
  } else if (message.data && !message.data.error) {
    // if there's data, but no .response and no .error, it's an unexpected structure
    console.error("AssistantMessage: message.data exists but lacks .response and .error keys:", message.data);
    responseToRender = "Received an unexpected response structure. Please check console for details.";
  }
  // Note: if message.data.error exists, that path is handled by the JSX conditional rendering below.
  // If message.data is null/undefined, responseToRender remains "Assistant is processing...".

  // Determine if the final responseToRender string contains HTML
  const useHTML = typeof responseToRender === 'string' && /[<>]/g.test(responseToRender);

  return (
    <div className="my-2 flex justify-start">
      {/* Error display logic is now part of this conditional rendering */}
      {message.data && message.data.error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl shadow-md max-w-md lg:max-w-lg break-words">
          <p className="font-bold mb-1">Assistant Error</p>
          {/* Robustly handle if error itself is an object or string */}
          <p>{typeof message.data.message === 'object' ? JSON.stringify(message.data.message) : (message.data.message || (typeof message.data.error === 'object' ? JSON.stringify(message.data.error) : message.data.error))}</p>
        </div>
      ) : (
        // Normal response rendering path
        <div className="bg-slate-100 text-slate-800 py-2 px-4 rounded-xl shadow-md max-w-md lg:max-w-lg prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none break-words">
          {useHTML ? (
            <div dangerouslySetInnerHTML={{ __html: responseToRender }} />
          ) : (
            // responseToRender should always be a string here due to the logic above
            responseToRender
          )}
        </div>
      )}
    </div>
  );
}
