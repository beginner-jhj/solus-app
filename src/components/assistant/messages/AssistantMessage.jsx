export function AssistantMessage({ message }) {
  if (message.data?.error) {
    return (
      <div className="my-2 flex justify-start">
        <div className="bg-red-100 text-red-700 p-3 rounded-xl shadow-md max-w-md lg:max-w-lg break-words">
          <p className="font-bold mb-1">Assistant Error</p>
          <p>{message.data.message || "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  const responseText = message.data?.response || "Assistant is processing...";
  // Basic check if responseText might be HTML.
  // A more robust check or server-side flag would be better.
  const mightBeHtml = /[<>]/g.test(responseText); // Simple check for angle brackets

  return (
    <div className="my-2 flex justify-start">
      <div className="bg-slate-100 text-slate-800 py-2 px-4 rounded-xl shadow-md max-w-md lg:max-w-lg break-words">
        {mightBeHtml ? (
          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: responseText }}
          />
        ) : (
          <p>{responseText}</p>
        )}
      </div>
    </div>
  );
}
