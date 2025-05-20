import {Greeting} from "./Greeting";
import {Chat} from "./Chat";

export function ConversationContainer() {
    return (
        <div className="w-full h-full relative flex flex-col items-start justify-start">
            <Greeting />
            <Chat />
        </div>
    )
}