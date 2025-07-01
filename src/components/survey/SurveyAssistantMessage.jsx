import logo from "../../assets/logo.svg";
export function SurveyAssistantMessage({ message, isSurveyDone, finishSurveyCallback, useHtml = false }) {
  const { response, options = [] } = message.data || {};
  return (
    <div className="my-2 flex justify-start">
      <div className="flex flex-col items-start">
        <div className="flex items-center mb-1">
          <img src={logo} className="w-5 h-5 rounded-full border" alt="Assistant" />
        </div>
        <div className="bg-slate-100 text-slate-800 py-2 px-4 rounded-xl shadow-md max-w-md break-words text-sm">
          {useHtml ? (
            <span dangerouslySetInnerHTML={{ __html: response }} />
          ) : (
            response
          )}
          {options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((opt, idx) => (
                <div key={idx} className="px-2 py-1 border rounded text-xs bg-white">
                  {opt}
                </div>
              ))}
            </div>
          )}
          {isSurveyDone && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
  key={0}
  onClick={finishSurveyCallback}
  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full shadow-lg text-sm transition-transform duration-150 transform hover:scale-105 hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 border-0"
  style={{letterSpacing: '0.5px'}}
>
  <span style={{display: 'inline-block', verticalAlign: 'middle'}}>Finish Survey</span>
</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
