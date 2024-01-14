import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { SpotifyIcon } from "../components/icons/spotify";
import { LogoIcon } from "../components/icons/logo";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { Text, Center } from "@chakra-ui/react";

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
        <Loader2 className="animate-spin" />
      </Center>
    );
  }

  return (
    <motion.div
      animate={STEP_ANIMATION.animate}
      initial={STEP_ANIMATION.initial}
      exit={STEP_ANIMATION.exit}
      className="text-black relative h-full w-full"
    >
      <Center w="100px" h="100px">
        <LogoIcon />
      </Center>

      <center>
        <Text mt={175} fontSize={"5xl"}>
          <Text as="b">Tone</Text> ⎯ <Text as="i">vibing</Text>, made simple.
        </Text>
        <Text fontSize={"md"}>
          It&apos;s a match made in heaven. What are you waiting for?
        </Text>

        <div className="mt-10">
          {status === "unauthenticated" && (
            <button
              className="group flex mr-4 cursor-pointer py-2 px-4 rounded-lg bg-card text-white border border-border flex items-center"
              onClick={() => signIn("spotify")}
            >
              <SpotifyIcon className="mr-4" /> Sign in with Spotify{" "}
              <ArrowRight size={16} className="ml-2 group-hover:block hidden" />
            </button>
          )}
        </div>
      </center>
    </motion.div>
  );
}
