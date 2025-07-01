import logo from "../../assets/logo.svg";
export function SurveyAssistantMessage({ message }) {
  const { response, options = [] } = message.data || {};
  return (
    <div className="my-2 flex justify-start">
      <div className="flex flex-col items-start">
        <div className="flex items-center mb-1">
          <img src={logo} className="w-5 h-5 rounded-full border" alt="Assistant" />
        </div>
        <div className="bg-slate-100 text-slate-800 py-2 px-4 rounded-xl shadow-md max-w-md break-words text-sm">
          {response}
          {options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((opt, idx) => (
                <div key={idx} className="px-2 py-1 border rounded text-xs bg-white">
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
