import { useChannelMessage, useReadChannelState } from "@onehop/react";
import { startTransition, useEffect, useRef, useState } from "react";
import { HOP_CHANNEL_NAME } from "@/lib/constants";
import { Message, PickWhereValuesAre } from "@/utils/types";
import { getErrorMessage } from "@/utils/errors";

export default function Chat() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<Message>>([]);

  const [message, setMessage] = useState<Omit<Message, "id" | "isAdmin">>({
    author: "",
    content: "",
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useChannelMessage<Message>(HOP_CHANNEL_NAME, "MESSAGE_CREATE", (message) => {
    setMessages((messages) => [message, ...messages]);
  });

  const { state } = useReadChannelState<{ messages: Message[] }>(
    HOP_CHANNEL_NAME
  );

  useEffect(() => {
    if (messages.length === 0 && state && state.messages.length > 0) {
      setMessages(state.messages);
    }
  }, [state, messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const set = (key: keyof PickWhereValuesAre<Omit<Message, "id">, string>) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setMessage((m) => ({ ...m, [key]: event.target.value }));
    };
  };

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (message.content.trim() === "") {
            return;
          }

          setLoading(true);

          try {
            const request = new Request("/api/realtime/message", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(message),
            });

            const response = await fetch(request);
            const body = (await response.json()) as
              | { success: true }
              | { success: false; message: string };

            if (!body.success) {
              throw new Error(body.message);
            }

            setMessage((old) => ({ ...old, content: "" }));
          } catch (e: unknown) {
            console.error(e);
            alert(getErrorMessage(e));
          } finally {
            startTransition(() => {
              setLoading(false);
            });
          }
        }}
      >
        <input
          disabled={loading}
          type="text"
          placeholder="Author"
          value={message.author}
          onChange={set("author")}
        />

        <input
          ref={inputRef}
          disabled={loading}
          type="text"
          placeholder="Write a message..."
          value={message.content}
          onChange={set("content")}
        />

        <button disabled={loading} type="submit">
          Send
        </button>
      </form>

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.author}:<span>{message.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
