import { store } from "../../../store/store.js";

export function UserMessage({ message }) {
  const { profileImageURL } = store();

  return (
    <div className="my-2 flex justify-end">
      <div className="flex flex-col items-end">
        <div className="flex items-center mb-1">
          <img
            src={profileImageURL}
            className="w-5 h-5 rounded-full border"
            alt="User"
          />
        </div>
        <div className="bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md max-w-md lg:max-w-lg break-words text-sm">
          {message.data.message}
        </div>
      </div>
    </div>
  );
}
