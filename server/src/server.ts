import http from "http";
import { Server, Socket } from "socket.io";
import { pika } from "./utils/pika";
import { Room, User } from "./utils/types";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users: Record<string, User> = {};
const waitingQueue: string[] = [];
const rooms: Record<string, Room> = {};

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
      const roomId = rooms[socket.id]?.id;

      if (roomId) {
        // If the user was in a room, leave it and notify the other user
        const otherUserId = rooms[roomId].users.find((id) => id !== socket.id);
        if (otherUserId) {
          users[otherUserId].socket.leave(roomId);
          users[otherUserId].socket.emit("partner_left");
        }

        delete rooms[roomId];
      }

      delete users[socket.id];
      const index = waitingQueue.indexOf(socket.id);
      if (index !== -1) {
        waitingQueue.splice(index, 1);
      }
      console.log("user disconnected", socket.id);
    }
  });
});

function tryMatchmaking() {
  if (waitingQueue.length >= 2) {
    const userId1 = waitingQueue.shift();
    const userId2 = waitingQueue.find((id) => id !== userId1);

    if (userId1 && userId2) {
      const genres1 = users[userId1]?.genres || [];
      const genres2 = users[userId2]?.genres || [];

      const commonGenres = genres1.filter((genre) => genres2.includes(genre));

      if (commonGenres.length > 0) {
        const roomID = pika.gen("ch");
        rooms[roomID] = { id: roomID, users: [userId1, userId2] };

        users[userId1]?.socket.join(roomID);
        users[userId2]?.socket.join(roomID);

        users[userId1]?.socket.emit("matched", roomID);
        users[userId2]?.socket.emit("matched", roomID);

        console.log(
          `Matched users in room ${roomID} with common genres: ${commonGenres.join(
            ", "
          )}`
        );
      } else {
        // No common genres, put them back in the queue
        waitingQueue.push(userId1);
      }
    } else {
      if (!userId1) {
        return;
      }
      
      // If userId2 is not found, put userId1 back in the queue
      waitingQueue.push(userId1);
    }
  }
}

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});
