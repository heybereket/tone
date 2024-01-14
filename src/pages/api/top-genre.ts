import { prisma } from "@/lib/prisma";
import { getSession } from "@/utils/get-user-session";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user.email,
    },
  });

  const topArtists = await prisma.artist.findMany({
    where: {
      userId: user?.id,
    },
  });

  const allGenres: string[] = topArtists.flatMap((artist) => artist.genres);

  const genreCounts: { [genre: string]: number } = {};

  allGenres.forEach((genre) => {
    if (genreCounts[genre]) {
      genreCounts[genre]++;
    } else {
      genreCounts[genre] = 1;
    }
  });

  const genreCountsArray = Object.entries(genreCounts).map(
    ([genre, count]) => ({ genre, count })
  );

  genreCountsArray.sort((a, b) => b.count - a.count);

  const top5Genres = genreCountsArray.slice(0, 5);

  return res.status(200).json(top5Genres);
}
