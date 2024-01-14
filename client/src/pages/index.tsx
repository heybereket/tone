import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { SpotifyIcon } from "../components/icons/spotify";
import { motion } from "framer-motion";
import {
  connectSocket,
  disconnectSocket,
  registerUser,
  subscribeToRoom,
  sendMessage,
} from "@/utils/websocket.ts";
import prisma from "@/lib/services/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth].ts";
import { GetServerSideProps } from "next";
import Chat from "@/components/chat.tsx";
import { Message } from "@/utils/types.ts";

const STEP_ANIMATION = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

export default function Home({ genres }: { genres: string[] }) {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { data, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      await fetch("/api/spotify/top-artists");
      await fetch("/api/spotify/top-genres");
    };

    fetchData();
  }, []);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [currentRoom]);

  const handleRegister = () => {
    registerUser(genres, (roomId: string) => {
      setCurrentRoom(roomId);
      subscribeToRoom(roomId, (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage]);
      });
    });
  };

  const handleSendMessage = () => {
    if (currentRoom && message) {
      sendMessage(message, currentRoom, data?.user.id as string);
      setMessage("");
    }
  };

  return (
    <motion.div
      animate={STEP_ANIMATION.animate}
      initial={STEP_ANIMATION.initial}
      exit={STEP_ANIMATION.exit}
      className="text-white relative"
    >
      {status === "authenticated" && (
        <div className="absolute top-5 right-5">
          <button
            className="cursor-pointer bg-transparent text-black-700 font-semibold py-2 px-4 border border-grey-600 hover:backdrop-blur-sm rounded-lg"
            onClick={() => signOut()}
          >
            sign out
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 top-60 grid place-items-center">
        <div className="mb-12 flex items-center flex-col">
          <h1 className="text-5xl font-bold text-white text-center mb-2">
            {status === "authenticated"
              ? `👋 Hi, ${data.user.name}!`
              : `Welcome to Tone 🎶`}
          </h1>
          <p>
            {status === "authenticated"
              ? "Ready to jump in?"
              : "Meet people who share your music taste, people you can vibe with"}
          </p>
        </div>

        {/* {status === "unauthenticated" && (
          <button
            className="flex mr-4 cursr-pointer py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
            onClick={() => signIn("spotify")}
          >
            <SpotifyIcon className="mr-4" /> Sign in with Spotify
          </button>
        )}

        {status === "authenticated" && (    
          <button
            onClick={handleRegister}
            className="flex mr-4 cursr-pointer py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
          >
            Start matchmaking
          </button>
        )} */}

        {status === "unauthenticated" ? (
          <button
            className="flex mr-4 cursr-pointer py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
            onClick={() => signIn("spotify")}
          >
            <SpotifyIcon className="mr-4" /> Sign in with Spotify
          </button>
        ) : (
          !currentRoom && (
            <button
              onClick={handleRegister}
              className="flex mr-4 cursr-pointer py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
            >
              Start matchmaking
            </button>
          )
        )}

        {currentRoom && (
          <Chat
            messages={messages}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </motion.div>
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
