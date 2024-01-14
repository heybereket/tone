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

  if (user && user.topGenres && user.topGenres.length > 0) {
    return res.status(200).json(user?.topGenres);
  }

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

  const top5Genres = genreCountsArray.slice(0, 3).map((genre) => genre.genre);

  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      topGenres: top5Genres,
    },
  });

  return res.status(200).json(top5Genres);
}
