import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import recipeController from "./controller/controller";
import recipeImageController from "./controller/imageController";
import tryCatchHelper from "../../../utils/tryCatchHelper";
import { optionalUserAuthMiddleware } from "../../middleware/optionalUserAuth";
import { freemiumCheckMiddleware } from "../../middleware/freemiumCheck";
import { apiKeyAuthMiddleware } from "../../middleware/apiKeyAuth";

const recipesRouter = Router();

// Tighter rate limit for AI endpoint to control Gemini API costs
const recipesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many recipe requests. Please wait a few minutes." },
});

const ingredientsSchema = z.object({
  ingredients: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one ingredient is required")
    .max(20, "Maximum 20 ingredients allowed"),
});

const validateIngredients = (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
  const result = ingredientsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }
  req.body = result.data;
  next();
};

const recipesSchema = z.object({
  recipes: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        region: z.string().max(100).default(""),
      }),
    )
    .min(1)
    .max(3, "Maximum 3 recipes at a time"),
});

const validateRecipes = (
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) => {
  const result = recipesSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }
  req.body = result.data;
  next();
};

recipesRouter.post(
  "/suggest",
  recipesLimiter,
  apiKeyAuthMiddleware,          // API key path — sets userId + enforces monthly limit; skips if no key
  optionalUserAuthMiddleware,    // JWT path — attaches userId/plan if a valid token is present (skipped if apiKey already set userId)
  freemiumCheckMiddleware,       // enforces 3 generations/day for JWT free users (API key users already rate-limited above)
  validateIngredients,
  tryCatchHelper(recipeController.suggestRecipes),
);

// Separate tighter limit for image generation (more expensive per call)
const imagesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many image requests. Please wait a few minutes." },
});

recipesRouter.post(
  "/images",
  imagesLimiter,
  validateRecipes,
  tryCatchHelper(recipeImageController.generateImages),
);

export default recipesRouter;
