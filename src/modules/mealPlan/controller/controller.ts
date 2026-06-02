import { Request, Response } from "express";
import { z } from "zod";
import { type AuthenticatedRequest } from "../../../middleware/userAuth";
import MealPlanModel from "../../../../config/db/models/MealPlanModel";
import logger from "../../../../utils/logger";
import { updateUserStats } from "../../../../utils/services/stats";

const userId = (req: Request) => (req as AuthenticatedRequest).userId!;

/** Returns the Monday of the given date (UTC midnight). */
const toWeekStart = (raw: string): Date => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) throw new Error("Invalid weekStart date");
  const day = d.getUTCDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const slotSchema = z.object({
  weekStart: z.string(),
  day: z.number().int().min(0).max(6),
  savedRecipeId: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  region: z.string().max(100).default(""),
  imageUrl: z.string().nullable().optional(),
  ingredients: z.array(z.string()).default([]),
});

const removeSchema = z.object({
  weekStart: z.string(),
  day: z.number().int().min(0).max(6),
});

class MealPlanController {
  /** GET /meal-plan?weekStart=YYYY-MM-DD */
  get = async (req: Request, res: Response): Promise<void> => {
    const weekStart = toWeekStart((req.query.weekStart as string) ?? new Date().toISOString());
    const uid = userId(req);

    const plan = await MealPlanModel.findOneAndUpdate(
      { userId: uid, weekStart },
      { $setOnInsert: { userId: uid, weekStart, slots: [], updatedAt: new Date() } },
      { upsert: true, new: true },
    );

    res.json(plan);
  };

  /** PUT /meal-plan/slot — add or replace a recipe in a day slot */
  setSlot = async (req: Request, res: Response): Promise<void> => {
    const result = slotSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }

    const { weekStart: rawWeek, day, savedRecipeId, title, region, imageUrl, ingredients } =
      result.data;
    const weekStart = toWeekStart(rawWeek);
    const uid = userId(req);

    // Ensure document exists
    await MealPlanModel.findOneAndUpdate(
      { userId: uid, weekStart },
      { $setOnInsert: { userId: uid, weekStart, slots: [], updatedAt: new Date() } },
      { upsert: true },
    );

    // Pull any existing slot for this day, then push the new one
    const plan = await MealPlanModel.findOneAndUpdate(
      { userId: uid, weekStart },
      {
        $pull: { slots: { day } } as Record<string, unknown>,
        $set: { updatedAt: new Date() },
      },
      { new: true },
    );

    if (!plan) {
      res.status(500).json({ error: "Failed to retrieve meal plan — please try again" });
      return;
    }

    await MealPlanModel.findByIdAndUpdate(plan._id, {
      $push: {
        slots: { day, savedRecipeId: savedRecipeId ?? null, title, region, imageUrl: imageUrl ?? null, ingredients },
      },
    });

    const updated = await MealPlanModel.findById(plan._id);
    logger.info({ uid, weekStart, day }, "[MealPlan]: Slot set");

    // Award +50 XP if all 7 days are now planned (once per week)
    if ((updated?.slots.length ?? 0) === 7) {
      updateUserStats(uid, "fullWeek", { weekStart: weekStart.toISOString().slice(0, 10) });
    }

    res.json(updated);
  };

  /** DELETE /meal-plan/slot — remove a recipe from a day slot */
  clearSlot = async (req: Request, res: Response): Promise<void> => {
    const result = removeSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }

    const { weekStart: rawWeek, day } = result.data;
    const weekStart = toWeekStart(rawWeek);
    const uid = userId(req);

    const plan = await MealPlanModel.findOneAndUpdate(
      { userId: uid, weekStart },
      { $pull: { slots: { day } } as Record<string, unknown>, $set: { updatedAt: new Date() } },
      { new: true },
    );

    if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }
    res.json(plan);
  };
}

export default new MealPlanController();
