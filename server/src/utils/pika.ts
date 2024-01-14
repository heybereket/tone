import Pika from "pika-id";

export const pika = new Pika([
  "channel",
  {
    prefix: "ch",
    description: "Channels",
    secure: true,
  },
]);
