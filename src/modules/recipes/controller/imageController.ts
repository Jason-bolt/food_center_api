import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cloudinary from "../../../../config/cloudinary";
import logger from "../../../../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.5-flash-image supports generateContent with IMAGE responseModality
const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-image",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generationConfig: { responseModalities: ["IMAGE"] } as any,
});

const buildPrompt = (name: string, region: string) =>
  `Professional food photography of ${name}${region ? `, ${region} cuisine` : ""}. ` +
  `Overhead shot, beautifully plated on a rustic wooden surface, warm natural lighting, ` +
  `vibrant colors, appetizing presentation, restaurant quality. No text, no labels.`;

const generateAndUpload = async (
  name: string,
  region: string,
): Promise<string | null> => {
  try {
    const result = await imageModel.generateContent(buildPrompt(name, region));

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p) => p.inlineData?.data);

    if (!imgPart?.inlineData) {
      logger.warn({ name }, "[ImageController]: No image returned from model");
      return null;
    }

    const { mimeType, data } = imgPart.inlineData;
    const dataURI = `data:${mimeType};base64,${data}`;

    const uploaded = await cloudinary.uploader.upload(dataURI, {
      folder: "food_center/ai_recipes",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    logger.debug(
      { name, url: uploaded.secure_url },
      "[ImageController]: Image generated and uploaded",
    );

    return uploaded.secure_url;
  } catch (error) {
    logger.error({ error, name }, "[ImageController]: Failed to generate image");
    return null;
  }
};

class RecipeImageController {
  generateImages = async (req: Request, res: Response): Promise<void> => {
    const { recipes } = req.body as { recipes: { name: string; region: string }[] };

    logger.debug(
      { count: recipes.length },
      "[ImageController]: Generating images for recipes",
    );

    const results = await Promise.all(
      recipes.map(async ({ name, region }) => ({
        name,
        url: await generateAndUpload(name, region),
      })),
    );

    res.status(200).json({ images: results });
  };
}

const recipeImageController = new RecipeImageController();
export default recipeImageController;
