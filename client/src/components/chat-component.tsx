import dayjs from "dayjs";
import { SendHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

interface Message {
  sender: string
  text: string
  timestamp: Date
}

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "B", text: "Hey there!", timestamp: new Date() },
    { sender: "R", text: "Hi!", timestamp: new Date() },
  ]);

  const chatContainerRef = useRef(null);

  const addMessage = (sender: string, text: string) => {
    const newMessage = {
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    // Scroll to the bottom of the chat container when messages change
    if (chatContainerRef.current) {
      (chatContainerRef.current as HTMLDivElement).scrollTop = (chatContainerRef.current as HTMLDivElement).scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="w-[600px] space-y-4 mb-10 overflow-y-auto"
      ref={chatContainerRef}
    >
      {/* {messages.map((message, index) => (
        <ChatMessage key={index} sender={message.sender} text={message.text} />
      ))} */}
      <EnterMessage onSendMessage={addMessage} />
    </div>
  );
};

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

const ChatMessage = ( sender: string, text: string ) => (
  <div
    className={clsx(
      "flex items-center gap-2",
      sender === "B" ? "pr-36" : "justify-end pl-36"
    )}
  >
    <div
      className={clsx(
        "rounded-full bg-gray-600 py-1 px-3 self-end",
        sender === "R" && "ml-auto"
      )}
    >
      {sender}
    </div>
    <div
      className={clsx(
        "font-mono py-2 px-4 rounded-md text-left line-clamp-4",
        sender === "B"
          ? "bg-blue-500 rounded-tr-md rounded-tl-md rounded-br-md"
          : "bg-gray-500 rounded-tl-md rounded-bl-md rounded-tr-md"
      )}
    >
      {text}
    </div>
  </div>
);

const EnterMessage = ({
  onSendMessage,
}: {
  onSendMessage: (name: string, message: string) => void;
}) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.trim() != "") {
      onSendMessage("R", message);
      setMessage("");
    }
  };

  return (
    <div className="relative">
      <input
        placeholder="What's on your mind?"
        value={message}
        className="rounded-lg w-full py-2 px-3 pr-8 bg-card border border-border text-lightGray outline-none"
        onChange={(e) => setMessage(e.target.value)}
      />
      <div
        className={clsx("absolute inset-y-0 right-0 flex items-center pr-3", {
          "text-lightGray hover:cursor-not-allowed": message.trim() === "",
          "text-white hover:cursor-pointer": message.trim() !== "",
        })}
        onClick={sendMessage}
      >
        <SendHorizontal size={16} />
      </div>
    </div>
  );
};

export default Chat;
