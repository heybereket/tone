import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export async function getSession({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user.email,
    },
  });

  const account = await prisma.account.findFirst({
    where: {
      userId: session?.user.id,
    },
  });

  return { session, account, user };
}
