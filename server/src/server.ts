// server.ts
import http from "http";
import { Server, Socket } from "socket.io";
import { pika } from "./utils/pika";
import { User } from "./utils/types";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users: Record<string, User> = {};
let waitingQueue: string[] = [];

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on(
    "register",
    (genres: string[], artists: string[], accessToken: string) => {
      users[socket.id] = { socket, genres, artists, accessToken };
      waitingQueue.push(socket.id);
      tryMatchmaking();
    }
  );

  socket.on(
    "send_message",
    async (message: string, sender: string, roomId: string) => {
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

async function tryMatchmaking() {
  while (waitingQueue.length >= 2) {
    const user1Id = waitingQueue.shift();
    const user2Id = waitingQueue.shift();

    if (!user1Id || !user2Id) {
      continue;
    }

    if (!users[user1Id] || !users[user2Id]) {
      // If either user is not available, continue with the next iteration
      continue;
    }

    const user1 = users[user1Id];
    const user2 = users[user2Id];

    const commonGenres = user1.genres.filter((genre) =>
      user2.genres.includes(genre)
    );

    if (commonGenres.length > 0) {
      const roomID = pika.gen("ch");

      // Fetch top song using the accessToken of the first user (user1)
      const topSong: any = await fetch(
        `https://api.spotify.com/v1/recommendations/?limit=1&seed_genres=${commonGenres.join(
          ","
        )}&seed_artists=${user1.artists.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${user1.accessToken}`,
          },
        }
      ).then((res) => res.json());

      if (topSong.tracks && topSong.tracks.length > 0) {
        // Join both users to the room
        user1.socket.join(roomID);
        user2.socket.join(roomID);
        // Notify both users
        user1.socket.emit("matched", roomID);
        user2.socket.emit("matched", roomID);

        // Play song for everyone in the room
        io.to(roomID).emit("play_song", topSong.tracks[0].uri);
      } else {
        console.error(
          "No tracks found in topSong or topSong.tracks is undefined"
        );
      }

      console.log(
        `Matched users ${user1Id} and ${user2Id} in room ${roomID} with common genres: ${commonGenres.join(
          ", "
        )}`
      );
    } else {
      if (user1Id && user2Id) {
        // If no common genres, re-add users to the waiting queue
        waitingQueue.push(user1Id, user2Id);
      }
    }
  }
}

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});
