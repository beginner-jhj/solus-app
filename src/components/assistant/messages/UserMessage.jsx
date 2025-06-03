export function UserMessage({ message }) {
  return (
    <div className="my-2 flex justify-end">
      <div className="bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md max-w-md lg:max-w-lg break-words">
        {message.data.message}
      </div>
    </div>
  );
}
