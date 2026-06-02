import { Request, Response } from "express";
import { z } from "zod";
import { type AuthenticatedRequest } from "../../../middleware/userAuth";
import SavedRecipeModel from "../../../../config/db/models/SavedRecipeModel";
import CollectionModel from "../../../../config/db/models/CollectionModel";
import logger from "../../../../utils/logger";
import { updateUserStats } from "../../../../utils/services/stats";

const saveSchema = z.object({
  title: z.string().min(1).max(200),
  region: z.string().max(100).default(""),
  markdown: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  collectionId: z.string().nullable().optional(),
});

const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(100).trim(),
});

const userId = (req: Request) => (req as AuthenticatedRequest).userId!;

class SavedRecipesController {
  // GET /saved-recipes?collectionId=<id|none>
  getAll = async (req: Request, res: Response): Promise<void> => {
    const { collectionId } = req.query;
    const filter: Record<string, unknown> = { userId: userId(req) };
    if (collectionId === "none") filter.collectionId = null;
    else if (typeof collectionId === "string" && collectionId) filter.collectionId = collectionId;

    const recipes = await SavedRecipeModel.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  };

  // POST /saved-recipes
  save = async (req: Request, res: Response): Promise<void> => {
    const result = saveSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { title, region, markdown, imageUrl, collectionId } = result.data;

    if (collectionId) {
      const col = await CollectionModel.findOne({ _id: collectionId, userId: userId(req) });
      if (!col) { res.status(400).json({ error: "Collection not found" }); return; }
    }

    const recipe = await SavedRecipeModel.create({
      userId: userId(req),
      collectionId: collectionId ?? null,
      title, region, markdown,
      imageUrl: imageUrl ?? null,
    });
    logger.info({ recipeId: recipe._id, userId: userId(req) }, "[SavedRecipes]: Recipe saved");
    // Award XP + update streak (fire-and-forget)
    updateUserStats(userId(req), "save");
    res.status(201).json(recipe);
  };

  // DELETE /saved-recipes/:id
  delete = async (req: Request, res: Response): Promise<void> => {
    const deleted = await SavedRecipeModel.findOneAndDelete({ _id: req.params.id, userId: userId(req) });
    if (!deleted) { res.status(404).json({ error: "Recipe not found" }); return; }
    res.json({ success: true });
  };

  // PUT /saved-recipes/:id/collection
  moveToCollection = async (req: Request, res: Response): Promise<void> => {
    const { collectionId } = req.body as { collectionId: string | null };
    if (collectionId) {
      const col = await CollectionModel.findOne({ _id: collectionId, userId: userId(req) });
      if (!col) { res.status(400).json({ error: "Collection not found" }); return; }
    }
    const recipe = await SavedRecipeModel.findOneAndUpdate(
      { _id: req.params.id, userId: userId(req) },
      { collectionId: collectionId ?? null },
      { new: true },
    );
    if (!recipe) { res.status(404).json({ error: "Recipe not found" }); return; }
    res.json(recipe);
  };

  // GET /saved-recipes/collections
  getCollections = async (req: Request, res: Response): Promise<void> => {
    const collections = await CollectionModel.find({ userId: userId(req) }).sort({ createdAt: -1 });
    res.json(collections);
  };

  // POST /saved-recipes/collections
  createCollection = async (req: Request, res: Response): Promise<void> => {
    const result = collectionSchema.safeParse(req.body);
    if (!result.success) { res.status(400).json({ error: result.error.issues[0].message }); return; }
    const collection = await CollectionModel.create({ userId: userId(req), name: result.data.name });
    res.status(201).json(collection);
  };

  // PUT /saved-recipes/collections/:id
  renameCollection = async (req: Request, res: Response): Promise<void> => {
    const result = collectionSchema.safeParse(req.body);
    if (!result.success) { res.status(400).json({ error: result.error.issues[0].message }); return; }
    const col = await CollectionModel.findOneAndUpdate(
      { _id: req.params.id, userId: userId(req) },
      { name: result.data.name },
      { new: true },
    );
    if (!col) { res.status(404).json({ error: "Collection not found" }); return; }
    res.json(col);
  };

  // DELETE /saved-recipes/collections/:id
  deleteCollection = async (req: Request, res: Response): Promise<void> => {
    const col = await CollectionModel.findOneAndDelete({ _id: req.params.id, userId: userId(req) });
    if (!col) { res.status(404).json({ error: "Collection not found" }); return; }
    // Move orphaned recipes to uncategorized
    await SavedRecipeModel.updateMany(
      { userId: userId(req), collectionId: req.params.id },
      { collectionId: null },
    );
    res.json({ success: true });
  };
}

export default new SavedRecipesController();
