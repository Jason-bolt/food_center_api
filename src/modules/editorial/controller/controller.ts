import { Request, Response } from "express";
import { z } from "zod";
import EditorialModel from "../../../../config/db/models/EditorialModel";
import logger from "../../../../utils/logger";

/** Returns the Monday (UTC midnight) of the ISO week that contains `date`. */
const weekMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sun … 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // shift so Mon = 0
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const editorialSchema = z.object({
  title:           z.string().min(1).max(200).trim(),
  region:          z.string().min(1).max(100).trim(),
  description:     z.string().min(1).max(600).trim(),
  imageUrl:        z.string().nullable().optional(),
  featuredFoodIds: z.array(z.string()).optional().default([]),
  // Accepts any date string — we normalise it to Monday of that week
  activeWeek:      z.string().min(1),
});

class EditorialController {
  /** GET /editorials/active — public, returns the current week's editorial or null */
  getActive = async (_req: Request, res: Response): Promise<void> => {
    const monday = weekMonday(new Date());
    const editorial = await EditorialModel.findOne({ activeWeek: monday }).lean();
    res.json(editorial ?? null);
  };

  /** GET /editorials — admin, full list newest first */
  getAll = async (_req: Request, res: Response): Promise<void> => {
    const editorials = await EditorialModel.find().sort({ activeWeek: -1 }).lean();
    res.json(editorials);
  };

  /** POST /editorials — admin */
  create = async (req: Request, res: Response): Promise<void> => {
    const result = editorialSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }

    const { title, region, description, imageUrl, featuredFoodIds, activeWeek } = result.data;
    const monday = weekMonday(new Date(activeWeek));

    try {
      const editorial = await EditorialModel.create({
        title, region, description,
        imageUrl: imageUrl ?? null,
        featuredFoodIds,
        activeWeek: monday,
      });
      logger.info({ editorialId: editorial._id }, "[Editorial]: Created");
      res.status(201).json(editorial);
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        res.status(409).json({ error: "An editorial already exists for that week. Delete or edit it first." });
        return;
      }
      throw err; // re-throw anything else for tryCatchHelper to handle
    }
  };

  /** PUT /editorials/:id — admin */
  update = async (req: Request, res: Response): Promise<void> => {
    const result = editorialSchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }

    const update: Record<string, unknown> = { ...result.data };
    if (result.data.activeWeek) {
      update.activeWeek = weekMonday(new Date(result.data.activeWeek));
    }

    let editorial;
    try {
      editorial = await EditorialModel.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true, runValidators: true },
      );
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        res.status(409).json({ error: "An editorial already exists for that week. Delete or edit it first." });
        return;
      }
      throw err;
    }

    if (!editorial) { res.status(404).json({ error: "Editorial not found" }); return; }

    logger.info({ editorialId: editorial._id }, "[Editorial]: Updated");
    res.json(editorial);
  };

  /** DELETE /editorials/:id — admin */
  remove = async (req: Request, res: Response): Promise<void> => {
    const editorial = await EditorialModel.findByIdAndDelete(req.params.id);
    if (!editorial) { res.status(404).json({ error: "Editorial not found" }); return; }
    logger.info({ editorialId: req.params.id }, "[Editorial]: Deleted");
    res.json({ message: "Deleted" });
  };
}

export default new EditorialController();
