import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API-handler til søgning af romaner
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { query } = req.query;

      // Validerer søgeforespørgslen
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Invalid search query" });
      }

      // Søger efter romaner baseret på titel eller kode
      const novels = await prisma.novel.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { code: parseInt(query) || undefined },
          ],
        },
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
      console.error("Error searching novels:", error);
      res.status(500).json({ error: "Error searching novels" });
    }
  } else {
    // Håndterer ikke-understøttede HTTP-metoder
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
