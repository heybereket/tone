import io from "socket.io-client";

let socket: ReturnType<typeof io>;

export const connectSocket = () => {
  socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string);
  console.log("Connecting socket...");
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

export const registerUser = (
  genres: string[],
  callback: (roomId: string) => void
) => {
  if (!socket) return;

  socket.emit("register", genres);

  socket.on("matched", (roomId: string) => {
    callback(roomId);
  });
};

export const subscribeToRoom = (
  roomId: string,
  callback: (message: string) => void
) => {
  if (!socket) return;

  socket.on("receive_message", (message: string) => {
    callback(message);
  });
};

export const sendMessage = (message: string, roomId: string) => {
  if (socket) socket.emit("send_message", message, roomId);
};
