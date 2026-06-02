import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../../../../utils/logger";
import { zIncrBy, expireKey } from "../../../../utils/services/redis";
import { currentWeekKey, TRENDING_KEY } from "../../trending/controller/controller";
import { updateUserStats } from "../../../../utils/services/stats";
import { type AuthenticatedRequest } from "../../../middleware/userAuth";

// Read once at startup — fail fast if unconfigured
const geminiApiKey = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a creative chef specialising in world cuisine with deep knowledge of African dishes and global food culture.

When given a list of ingredients, suggest exactly 2–3 recipes the user can realistically make. Prioritise recipes that use most of the provided ingredients, leaning toward African and world cuisine first, then broadening if needed.

For each recipe use this exact format:

## [Recipe Name] • [Region/Origin]

**Description:** One sentence describing the dish.

**Your ingredients used:** List which of the user's ingredients this recipe uses.

**Additional pantry staples needed:** Common items like oil, salt, water, spices — keep this brief.

**Steps:**
1. Step one
2. Step two
3. Step three
4. Step four

---

Be practical, concise, and encouraging. Do not add any preamble or closing remarks — go straight into the recipes.`;

class RecipeController {
  suggestRecipes = async (req: Request, res: Response): Promise<void> => {
    const { ingredients } = req.body as { ingredients: string[] };

    if (!geminiApiKey) {
      logger.error("[RecipeController]: GEMINI_API_KEY is not set");
      res.status(500).json({ error: "Server misconfiguration" });
      return;
    }

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const prompt = `I have these ingredients: ${ingredients.join(", ")}. What recipes can I make?`;

      logger.debug(
        { ingredientCount: ingredients.length },
        "[RecipeController]: Streaming recipe suggestions",
      );

      const authUserId = (req as AuthenticatedRequest).userId;

      // Log ingredients to Redis trending (fire-and-forget — never block the stream)
      const weekKey = TRENDING_KEY(currentWeekKey());
      Promise.all(
        ingredients.map((ing) => zIncrBy(weekKey, 1, ing.toLowerCase().trim())),
      )
        .then(() => expireKey(weekKey, 60 * 60 * 24 * 14)) // one TTL reset per request, not per ingredient
        .catch((err) => logger.warn({ err }, "[Trending]: Failed to log ingredients"));

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      // Award XP only after successful stream — fire-and-forget
      if (authUserId) updateUserStats(authUserId, "generate");

      res.write("data: [DONE]\n\n");
      res.end();

      logger.debug("[RecipeController]: Stream complete");
    } catch (error) {
      logger.error({ error }, "[RecipeController]: Gemini stream failed");
      const message = error instanceof Error ? error.message : "";
      const userMessage = message.includes("429")
        ? "Gemini API quota exceeded. Please try again later or check your API plan."
        : message.includes("403") || message.includes("API key")
          ? "Invalid Gemini API key. Check your GEMINI_API_KEY environment variable."
          : "Failed to generate recipes. Please try again.";
      res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
      res.end();
    }
  };
}

const recipeController = new RecipeController();
export default recipeController;
