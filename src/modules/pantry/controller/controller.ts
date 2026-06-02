import { Request, Response } from "express";
import { z } from "zod";
import { type AuthenticatedRequest } from "../../../middleware/userAuth";
import PantryModel from "../../../../config/db/models/PantryModel";

const uid = (req: Request) => (req as AuthenticatedRequest).userId!;

const ingredientsSchema = z.object({
  ingredients: z.array(z.string().min(1).max(80).trim()).max(100),
});

const singleSchema = z.object({
  ingredient: z.string().min(1).max(80).trim(),
});

class PantryController {
  /** GET /pantry — return pantry (creates empty one if none exists) */
  get = async (req: Request, res: Response): Promise<void> => {
    const pantry = await PantryModel.findOneAndUpdate(
      { userId: uid(req) },
      { $setOnInsert: { userId: uid(req), ingredients: [], updatedAt: new Date() } },
      { upsert: true, new: true },
    );
    res.json(pantry);
  };

  /** PUT /pantry — replace entire ingredients list */
  setAll = async (req: Request, res: Response): Promise<void> => {
    const result = ingredientsSchema.safeParse(req.body);
    if (!result.success) { res.status(400).json({ error: result.error.issues[0].message }); return; }

    // Deduplicate and normalise
    const ingredients = [
      ...new Set(result.data.ingredients.map((i) => i.toLowerCase())),
    ];

    const pantry = await PantryModel.findOneAndUpdate(
      { userId: uid(req) },
      { $set: { ingredients, updatedAt: new Date() } },
      { upsert: true, new: true },
    );
    res.json(pantry);
  };

  /** POST /pantry/ingredient — add a single ingredient */
  addOne = async (req: Request, res: Response): Promise<void> => {
    const result = singleSchema.safeParse(req.body);
    if (!result.success) { res.status(400).json({ error: result.error.issues[0].message }); return; }

    const ingredient = result.data.ingredient.toLowerCase();

    const pantry = await PantryModel.findOneAndUpdate(
      { userId: uid(req) },
      {
        $addToSet: { ingredients: ingredient },
        $set: { updatedAt: new Date() },
        $setOnInsert: { userId: uid(req) },
      },
      { upsert: true, new: true },
    );
    res.json(pantry);
  };

  /** DELETE /pantry/ingredient — remove a single ingredient */
  removeOne = async (req: Request, res: Response): Promise<void> => {
    const result = singleSchema.safeParse(req.body);
    if (!result.success) { res.status(400).json({ error: result.error.issues[0].message }); return; }

    const ingredient = result.data.ingredient.toLowerCase();

    const pantry = await PantryModel.findOneAndUpdate(
      { userId: uid(req) },
      { $pull: { ingredients: ingredient } as Record<string, unknown>, $set: { updatedAt: new Date() } },
      { new: true },
    );
    if (!pantry) { res.status(404).json({ error: "Pantry not found" }); return; }
    res.json(pantry);
  };
}

export default new PantryController();
