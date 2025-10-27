import IMiddleware from "./Imiddleware";
import { NextFunction, Request, Response } from "express";
import { createInfluencerSchema } from "../../../../config/zod/schemas/influencer";
import InfluencerModel from "../../../../config/db/models/InfluencerModel";
import logger from "../../../../utils/logger";

class InfluencerMiddleware implements IMiddleware {
  validateInfluencer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const result = createInfluencerSchema.safeParse(req.body);
    if (!result.success) {
      logger.error(
        req.body,
        "[InfluencerMiddleware - validateInfluencer]: Bad influencer data"
      );
      res.status(400).json({ error: result.error.message });
      return;
    }
    logger.debug(
      req.body,
      "[InfluencerMiddleware - validateInfluencer]: Raw influencer data"
    );
    next();
  };

  isUniqueInfluencerName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const influencer = await InfluencerModel.findOne({ name: req.body?.name });
    if (influencer) {
      logger.error(
        { influencerName: req.body?.name },
        "[InfluencerMiddleware - isUniqueInfluencerName]: Influencer name is already taken"
      );
      res.status(400).json({ error: "Influencer already exists" });
      return;
    }
    logger.debug(
      { influencerName: req.body?.name },
      "[InfluencerMiddleware - isUniqueInfluencerName]: Influencer name is valid"
    );
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
      logger.error(
        { influencerId: req.params?.id || req.body?.id },
        "[InfluencerMiddleware - doesInfluencerExist]: Influencer with ID does not exist"
      );
      res.status(404).json({ error: "Influencer does not exist" });
      return;
    }
    logger.debug(
      { influencerId: req.params?.id || req.body?.id },
      "[InfluencerMiddleware - doesInfluencerExist]: Influencer with ID is valid"
    );
    next();
  };
}

const influencerMiddleware = new InfluencerMiddleware();
export default influencerMiddleware;
