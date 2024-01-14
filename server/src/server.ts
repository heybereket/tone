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
  for (let i = 0; i < waitingQueue.length; i++) {
    const userId = waitingQueue[i];

    if (!users[userId]) {
      // Skip if the user doesn't exist (perhaps they disconnected)
      continue;
    }

    const currentUserGenres = users[userId].genres;

    for (let j = i + 1; j < waitingQueue.length; j++) {
      const potentialMatchId = waitingQueue[j];

      if (!users[potentialMatchId]) {
        // Skip if the potential match doesn't exist (perhaps they disconnected)
        continue;
      }

      const potentialMatchGenres = users[potentialMatchId].genres;

      const commonGenres = currentUserGenres.filter((genre) =>
        potentialMatchGenres.includes(genre)
      );

      if (commonGenres.length > 0) {
        const roomID = pika.gen("ch");
        const user = users[userId];

        const topSong: any = await fetch(
          `https://api.spotify.com/v1/recommendations/?limit=1&seed_genres=${user.genres.join(
            ","
          )}&seed_artists=${user.artists.join(",")}`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        ).then((res) => res.json());

        if (users[userId] && users[potentialMatchId]) {
          users[userId].socket?.join(roomID); // Use optional chaining to avoid errors
          users[potentialMatchId].socket?.join(roomID); // Use optional chaining to avoid errors
        }

        if (users[userId]) {
          users[userId].socket?.emit("matched", roomID); // Use optional chaining to avoid errors
        }

        if (users[potentialMatchId]) {
          users[potentialMatchId].socket?.emit("matched", roomID); // Use optional chaining to avoid errors
        }

        if (topSong && topSong.tracks && topSong.tracks.length > 0) {
          io.to(roomID).emit("play_song", topSong.tracks[0].uri);
        } else {
          console.error(
            "No tracks found in topSong or topSong.tracks is undefined"
          );
        }
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
  }
}

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});
