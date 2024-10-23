import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API-handler til at hente alle romaner
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Hent alle romaner med deres kapitler
      const novels = await prisma.novel.findMany({
        include: {
          chapters: {
            orderBy: {
              chapterNumber: "asc",
            },
          },
        },
      });

      res.status(200).json(novels);
    } catch (error) {
      console.error("Error fetching novels:", error);
      res.status(500).json({ error: "Error fetching novels" });
    }
  } else {
    // Håndter ikke-understøttede HTTP-metoder
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
