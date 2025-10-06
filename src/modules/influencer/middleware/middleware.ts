import IMiddleware from "./Imiddleware";
import { NextFunction, Request, Response } from "express";
import { createInfluencerSchema } from "../../../../config/zod/schemas/influencer";

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
}

const influencerMiddleware = new InfluencerMiddleware();
export default influencerMiddleware;
