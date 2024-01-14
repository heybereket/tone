import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { SpotifyIcon } from "../components/icons/spotify";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { Center } from "@/components/center";

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

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/match");
    }
  }, [router, status]);

  if (status === "loading" || status === "authenticated") {
    return (
      <Center>
        <Loader2 className="animate-spin text-white" />
      </Center>
    );
  }

  return (
    <motion.div
      animate={STEP_ANIMATION.animate}
      initial={STEP_ANIMATION.initial}
      exit={STEP_ANIMATION.exit}
      className="text-white relative"
    >
      {status === "unauthenticated" && (
        <div className="absolute top-5 right-5">
          <button
            className="cursor-pointer bg-transparent font-semibold py-2 px-4 text-gray-400 border-border hover:text-black transition-all duration-300 rounded-lg"
            onClick={() => signOut()}
          >
            sign out
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 top-60 grid place-items-center">
        {status === "unauthenticated" && (
          <button
            className="flex mr-4 cursr-pointer py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
            onClick={() => signIn("spotify")}
          >
            <SpotifyIcon className="mr-4" /> Sign in with Spotify
          </button>
        )}
      </div>
    </motion.div>
  );
}
