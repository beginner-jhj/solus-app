export function SurveyUserMessage({ message }) {
  return (
    <div className="my-2 flex justify-end">
      <div className="flex flex-col items-end">
        <div className="bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md max-w-md break-words text-sm">
          {message.data.message}
        </div>
      </div>
    </div>
  );
}
