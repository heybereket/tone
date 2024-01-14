import { useEffect, useState } from "react";
import {
  connectSocket,
  disconnectSocket,
  registerUser,
  subscribeToRoom,
  sendMessage,
} from "@/utils/websocket.ts";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "@/lib/services/prisma";
import { authOptions } from "./api/auth/[...nextauth]";
import { Message } from "@/utils/types";
import { useSession } from "next-auth/react";
import Chat from "@/components/chat";
import { Center } from "@/components/center";

export default function MatchPage({ genres }: { genres: string[] }) {
  const { data, status } = useSession();

  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleRegister = () => {
    registerUser(genres, (roomId: string) => {
      setCurrentRoom(roomId);
      subscribeToRoom(roomId, (data: Message) => {
        setMessages((prev) => [...prev, data]);
      });
    });
  };

  const handleSendMessage = () => {
    if (currentRoom && message) {
      sendMessage(message, data?.user.id as string, currentRoom);
      setMessage("");
    }
  };

  console.log("current room", currentRoom);

  return (
    <div>
      {currentRoom ? (
        <Center>
          <Chat
            onSendMessage={handleSendMessage}
            messages={messages}
            message={message}
            setMessage={setMessage}
          />
        </Center>
      ) : (
        <button
          onClick={handleRegister}
          className="flex mr-4 cursr-pointer py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
        >
          Start matchmaking
        </button>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user) {
    return {
      props: {},
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id as string,
    },
  });

  return {
    props: {
      genres: user?.topGenres ?? [],
    },
  };
};
