import { SendHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Message } from "@/utils/types";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";

export function Chat({
  messages,
  onSendMessage,
  message,
  setMessage,
}: {
  messages: any[];
  onSendMessage: () => void;
  message: string;
  setMessage: (message: string) => void;
}) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      (chatContainerRef.current as HTMLDivElement).scrollTop = (
        chatContainerRef.current as HTMLDivElement
      ).scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="w-[600px] space-y-4 overflow-y-auto"
      ref={chatContainerRef}
    >
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}

      <EnterMessage
        message={message}
        onChange={setMessage}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

// other user
// const Chat1 = () => (
//   <div className="flex items-center gap-2 pr-36">
//     <div className="rounded-full bg-gray-600 py-1 px-3 self-end">B</div>
//     <div className="font-mono py-2 px-4 bg-blue-500 rounded-tr-md rounded-tl-md rounded-br-md text-left tracking-light line-clamp-4">
//       Hey there!
//     </div>
//   </div>
// );

// user
// const Chat2 = () => {
//   return (
//     <div className="">
//       <div className="flex items-center gap-2 justify-end pl-36">
//         <div className="font-mono py-2 px-4 bg-gray-500 rounded-tl-md rounded-bl-md rounded-tr-md text-left line-clamp-4">
//           Hey!
//         </div>
//         <div className="rounded-full bg-gray-600 py-1 px-3 self-end">R</div>
//       </div>

//       <p className="flex justify-end text-lightGray text-xs mt-2">
//         Delivered at {dayjs(new Date().toISOString()).format("h:mm A")}
//       </p>
//     </div>
//   );
// };

const ChatMessage = ({ message }: { message: Message }) => {
  const { data } = useSession();

  if (message.sender === data?.user.id) {
    return (
      <div className="flex items-center gap-2 justify-end pl-36">
        <div className="font-mono py-2 px-4 bg-gray-300 rounded-tl-md rounded-bl-md rounded-tr-md text-left line-clamp-4">
          {message.message}
        </div>
        <div className="rounded-full bg-gray-400 py-1 px-3 self-end">
          {data.user.name?.slice(0, 1).toUpperCase()}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-2 pr-36">
        <div className="rounded-full bg-gray-600 py-1 px-3 self-end">??</div>
        <div className="font-mono py-2 px-4 bg-blue-500 rounded-tr-md rounded-tl-md rounded-br-md text-left tracking-light line-clamp-4">
          {message.message}
        </div>
      </div>
    );
  }
};

const EnterMessage = ({
  message,
  onSendMessage,
  onChange,
}: {
  message: string;
  onSendMessage: () => void;
  onChange: (message: string) => void;
}) => {
  return (
    <div className="relative">
      <input
        placeholder="What's on your mind?"
        className="rounded-lg w-full py-2 px-3 pr-8 bg-card border border-border text-lightGray outline-none"
        value={message}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSendMessage();
          }
        }}
      />
      <div
        className={clsx("absolute inset-y-0 right-0 flex items-center pr-3", {
          "text-lightGray hover:cursor-not-allowed": message.trim() === "",
          "text-white hover:cursor-pointer": message.trim() !== "",
        })}
        onClick={onSendMessage}
      >
        <SendHorizontal size={16} />
      </div>
    </div>
  );
};

export default Chat;
