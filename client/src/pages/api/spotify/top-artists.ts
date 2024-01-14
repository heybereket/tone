import { fetchSpotifyAPI } from "@/lib/services/spotify";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/services/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findFirst({
    where: {
      id: session?.user.id,
    },
  });

  if (user?.hasFetchedArtists) {
    return res.status(200).send("Already fetched artists");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session?.user.id,
    },
  });

  const topArtists = await fetchSpotifyAPI({
    token: account?.access_token as string,
    endpoint: "v1/me/top/artists?time_range=medium_term&limit=50",
  });

  const parsedTopArtists = topArtists.items.map((artist: any) => {
    const images = artist.images.map((image: any) => image.url);

    return {
      id: artist.id,
      name: artist.name,
      image: images[0],
      genres: artist.genres,
    };
  });

  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      hasFetchedArtists: true,
    },
  });

  await prisma.artist.createMany({
    data: parsedTopArtists.map((artist: any) => ({
      id: artist.id,
      userId: user?.id,
      name: artist.name,
      image: artist.image,
      genres: artist.genres,
    })),
    skipDuplicates: true,
  });

  return res.status(200).json(parsedTopArtists);
}
