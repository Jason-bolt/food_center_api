import IMiddleware from "./Imiddleware";
import { NextFunction, Request, Response } from "express";
import { createInfluencerSchema } from "../../../../config/zod/schemas/influencer";
import InfluencerModel from "../../../../config/db/models/InfluencerModel";

class InfluencerMiddleware implements IMiddleware {
  validateInfluencer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const result = createInfluencerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    next();
  };

  isUniqueInfluencerName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const influencer = await InfluencerModel.findOne({ name: req.body?.name });
    if (influencer) {
      res.status(400).json({ error: "Influencer already exists" });
      return;
    }
    next();
  };

  doesInfluencerExist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const influencer = await InfluencerModel.findById(
      req.params?.id || req.body?.id
    );
    if (!influencer) {
      res.status(404).json({ error: "Influencer does not exist" });
      return;
    }
    next();
  };
}

const influencerMiddleware = new InfluencerMiddleware();
export default influencerMiddleware;
