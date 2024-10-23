import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API-handler til at hente en roman
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { uid } = req.query;

      if (!uid || typeof uid !== "string") {
        return res.status(400).json({ error: "Invalid novel ID" });
      }

      // Hent roman med kapitler fra databasen
      const novel = await prisma.novel.findUnique({
        where: { id: uid },
        include: { chapters: { orderBy: { chapterNumber: "asc" } } },
      });

      if (!novel) {
        return res.status(404).json({ error: "Novel not found" });
      }

      res.status(200).json({ novel });
    } catch (error) {
      console.error("Error fetching novel:", error);
      res.status(500).json({ error: "Error fetching novel" });
    }
  } else {
    // Håndter ikke-understøttede HTTP-metoder
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
