// Importerer nødvendige moduler
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Initialiserer OpenAI og Prisma klienter
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

// Hovedfunktion til at håndtere API-anmodninger
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const novels = [];

      // Genererer 10 romaner
      for (let i = 0; i < 10; i++) {
        const novelId = uuidv4();
        const title = await generateTitle();
        const category = generateCategory();

        const novel = await prisma.novel.create({
          data: {
            id: novelId,
            title: title,
            category: category,
            code: Math.floor(Math.random() * 100000) + 1,
          },
        });

        // Genererer indhold for romanen
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are creating intense, modern stories for adults.",
            },
            {
              role: "user",
              content: `Generate a 5-chapter intense, modern story based on the title "${title}".`,
            },
          ],
          max_tokens: 7500,
        });

        const generatedContent = completion.choices[0].message.content;
        if (!generatedContent) {
          throw new Error("Failed to generate content");
        }

        // Opretter et nyt kapitel
        const newChapter = await prisma.chapter.create({
          data: {
            id: uuidv4(),
            chapterNumber: 1,
            content: generatedContent,
            novelId: novelId,
          },
        });

        novels.push({ ...novel, chapters: [newChapter] });
      }

      res.status(200).json({
        message:
          "3 intense, modern stories with 5 chapters each generated and saved",
        novels,
      });
    } catch (error) {
      console.error("Error generating stories:", error);
      res.status(500).json({ error: "Error generating stories" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Funktion til at generere en titel
async function generateTitle(): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a title generator for intense, modern adult stories. The title should be a brief summary of the most shocking or interesting part of the story. Ensure the title suggests a physically possible and realistic scenario.",
      },
      {
        role: "user",
        content:
          "Generate a provocative title for an intense, modern adult story.",
      },
    ],
    max_tokens: 30,
  });

  const generatedTitle = completion.choices[0].message.content;
  if (!generatedTitle) {
    throw new Error("Failed to generate title");
  }

  return generatedTitle.replace(/^"(.*)"$/, "$1").trim();
}

// Funktion til at generere en kategori
function generateCategory(): string {
  const categories = ["Confrontational", "Romantic", "Neutral"];
  return categories[Math.floor(Math.random() * categories.length)];
}
