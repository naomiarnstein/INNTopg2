// Importerer nødvendige moduler
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "../../../firebaseConfig";

const prisma = new PrismaClient();

// API-handler til at generere og uploade billeder for romaner
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Henter romaner uden billeder
    const novels = await prisma.novel.findMany({
      where: {
        imageUrl: null,
      },
    });

    for (const novel of novels) {
      const imageData = await generateImage(novel.title, novel.category);

      const response = await fetch(imageData);
      const blob = await response.blob();

      // Uploader billedet til Firebase Storage
      const imagePath = `novel-images/${novel.id}.jpg`;
      const imageRef = ref(firebaseStorage, imagePath);
      await uploadBytes(imageRef, blob);

      // Opdaterer romanens imageUrl i databasen
      await prisma.novel.update({
        where: { id: novel.id },
        data: {
          imageUrl: `${
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          }${encodeURIComponent(imagePath)}?alt=media`,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Images created and uploaded successfully" });
  } catch (error) {
    console.error("Error creating images:", error);
    res.status(500).json({
      error: "Error creating images",
      details: (error as Error).message,
    });
  }
}

// Funktion til at generere billede baseret på genre
async function generateImage(prompt: string, genre: string): Promise<string> {
  let imagePrompt: string;

  switch (genre.toLowerCase()) {
    case "confrontational":
      imagePrompt = `A confrontational scene with a handsome man and a beautiful woman standing side by side, looking angry at each other.`;
      break;
    case "romantic":
      imagePrompt = `A tender yet intense moment of a handsome man and a beautiful woman.`;
      break;
    default:
      imagePrompt = `A handsome man and a beautiful woman standing back to back, their postures exuding intensity and connection.`;
  }

  // Sender anmodning til Leonardo AI for at generere billede
  const response = await fetch(
    "https://cloud.leonardo.ai/api/rest/v1/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
        width: 512,
        height: 512,
        num_images: 1,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`
    );
  }

  const data = await response.json();
  const generationId = data.sdGenerationJob.generationId;

  // Venter på at billedet bliver genereret
  let imageData: string | null = null;
  while (!imageData) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const generationResponse = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
        },
      }
    );

    if (!generationResponse.ok) {
      throw new Error(`HTTP error! status: ${generationResponse.status}`);
    }

    const generationData = await generationResponse.json();
    if (generationData.generations_by_pk.status === "COMPLETE") {
      imageData = generationData.generations_by_pk.generated_images[0].url;
    }
  }

  return imageData;
}
