import io from "socket.io-client";
import { Message } from "./types";

let socket: ReturnType<typeof io>;

export const connectSocket = async () => {
  socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string);
  console.log("Connecting socket...");
};

export const disconnectSocket = async () => {
  console.log("Disconnecting socket...");

  if (socket) {
    socket.disconnect();
  }
};

export const registerUser = (
  genres: string[],
  artists: string[],
  accessToken: string,
  callback: (roomId: string) => void
) => {
  if (!socket) return;

  socket.emit("register", genres, artists, accessToken);

  socket.on("matched", callback);
};

export const subscribeToRoom = (
  roomId: string,
  callback: (data: Message) => void
) => {
  if (!socket) return;

  socket.off("receive_message").on("receive_message", (message, sender) => {
    callback({ message, sender });
  });
};

export const songPlayed = (
  roomId: string,
  callback: (song: string) => void
) => {
  if (!socket) return;

  socket.off("play_song").on("play_song", (song) => {
    callback(song);
  });
};

export const sendMessage = (
  message: string,
  sender: string,
  roomId: string
) => {
  if (socket) socket.emit("send_message", message, sender, roomId);
};
