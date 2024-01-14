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
import { signOut, useSession } from "next-auth/react";
import Chat from "@/components/chat";
import { Center } from "@/components/center";
import { Search } from "lucide-react";
import { SimpleGrid, Box, Text } from "@chakra-ui/react";
import { fetchSpotifyAPI } from "@/lib/services/spotify";
import { Account, Artist } from "@prisma/client";
import { Spotify } from "react-spotify-embed";

export default function MatchPage({
  genres,
  account,
  artists,
}: {
  genres: string[];
  account: Account;
  artists: Artist[];
}) {
  const { data } = useSession();

  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendList, setFriendList] = useState<string[]>([
    "David",
    "Owen",
    "Akshay",
    "Tae",
    "Varun",
    "Ankur",
    "Bereket",
    "Roozbeh",
  ]);
  const [song, setSong] = useState(null);

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

  useEffect(() => {
    if (currentRoom) {
      const fetchTopSong = async () => {
        const topSong = await fetchSpotifyAPI({
          token: account.access_token as string,
          endpoint: `v1/recommendations/?limit=1&seed_genres=${genres.join(
            ","
          )}&seed_artists=${artists
            .slice(0, 1)
            .map((artist) => artist.id)
            .join(",")}`,
        });

        setSong(topSong.tracks[0].external_urls.spotify);
      };

      fetchTopSong();
    }
  }, [account.access_token, artists, currentRoom, genres]);


  return (
    <div>
      <div className="flex items-center justify-center relative">
        <div className="absolute top-5 right-5">
          <p
            onClick={() => signOut()}
            className="font-medium text-gray-400 cursor-pointer border-border hover:text-black transition-all duration-300"
          >
            sign out
          </p>
        </div>

        <div className="absolute bottom-20 right-3">
          {song && <Spotify wide link={song} />}
        </div>

        <div className="mt-16">
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
            <div className="flex items-center text-center align-center justify-center w-full mt-10">
              <button
                onClick={handleRegister}
                className="w-[600px] flex justify-center items-center py-2 px-4 rounded-lg bg-card text-lightGray border border-border hover:text-white transition-all duration-300"
              >
                <Search size={16} className="mr-4" /> Start matchmaking
              </button>
            </div>
          )}
        </div>
      </div>
      <center>
        {/* <Text fontWeight={'semibold'} align={'center'}>Your friends.</Text> */}
        {!currentRoom && (
          <SimpleGrid
            justifyItems={"center"}
            columns={3}
            spacingX="60px"
            width={775}
            height={500}
            padding={20}
          >
            {Object.keys(friendList).map((keyName, i) => (
              <Box
                key={i}
                borderColor="gray"
                height="60px"
                width="150px"
                borderRadius="lg"
                maxW="sm"
                borderWidth="1px"
                overflow="hidden"
                bgGradient='linear(to-r, green.200, pink.500)'
              >
                <Text mt={4} fontWeight={"semibold"} color="black">
                  {friendList[i]}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </center>
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

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id as string,
    },
  });

  const artists = await prisma.artist.findMany({
    where: {
      userId: session.user.id as string,
    },
  });

  return {
    props: {
      genres: user?.topGenres,
      account,
      artists,
    },
  };
};
