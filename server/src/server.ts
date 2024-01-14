// server.ts
import http from "http";
import { Server, Socket } from "socket.io";
import { pika } from "./utils/pika";

interface User {
  socket: Socket;
  genres: string[];
}

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

let users: Record<string, User> = {};
let waitingQueue: string[] = [];

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("register", (genres: string[]) => {
    users[socket.id] = { socket, genres };
    waitingQueue.push(socket.id);
    tryMatchmaking();
  });

  socket.on(
    "send_message",
    (message: string, sender: string, roomId: string) => {
      io.to(roomId).emit("receive_message", message, sender);
    }
  );

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      delete users[socket.id];
      waitingQueue = waitingQueue.filter((id) => id !== socket.id);
      console.log("user disconnected", socket.id);
    }
  });
});

function tryMatchmaking() {
  waitingQueue.forEach((userId, index) => {
    const currentUserGenres = users[userId].genres;

    for (let i = index + 1; i < waitingQueue.length; i++) {
      const potentialMatchId = waitingQueue[i];
      const potentialMatchGenres = users[potentialMatchId].genres;

      const commonGenres = currentUserGenres.filter((genre) =>
        potentialMatchGenres.includes(genre)
      );

      if (commonGenres.length > 0) {
        const roomID = pika.gen("ch");

        users[userId].socket.join(roomID);
        users[potentialMatchId].socket.join(roomID);

        users[userId].socket.emit("matched", roomID);
        users[potentialMatchId].socket.emit("matched", roomID);

        console.log(
          `Matched users in room ${roomID} with common genres: ${commonGenres.join(
            ", "
          )}`
        );

        waitingQueue = waitingQueue.filter(
          (id) => id !== userId && id !== potentialMatchId
        );
        return;
      }
    }
  });
}

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});
