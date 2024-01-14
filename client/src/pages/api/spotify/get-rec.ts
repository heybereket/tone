// import { fetchSpotifyAPI } from "@/lib/services/spotify";
// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]";
// import prisma from "@/lib/services/prisma";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, authOptions);

//   const user = await prisma.user.findFirst({
//     where: {
//       email: session?.user.email,
//     },
//   });

//   const account = await prisma.account.findFirst({
//     where: {
//       userId: session?.user.id,
//     },
//   });

//   const topGenres = await prisma.account.findFirst({
//     select: {
//       topGenres: true,
//     }
//   })
//   const topGenre = topGenres[0]

//   const recs = await fetchSpotifyAPI({
//     token: account?.access_token as string,
//     endpoint: "v1/recommendations/?limit=1&seed genres={topGenre}",
//   });

//   return res.status(200).json(topGenre);
// }
