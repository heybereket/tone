import { Socket } from "socket.io";

export interface User {
  socket: Socket;
  genres: string[];
  artists: string[];
  accessToken: string;
}

export interface Room {
  id: string;
  users: string[];
}
