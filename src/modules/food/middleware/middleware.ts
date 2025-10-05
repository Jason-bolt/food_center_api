import IMiddleware from "./Imiddleware";
import { createFoodSchema } from "../../../../config/zod/schemas/food";
import { NextFunction, Request, Response } from "express";

class FoodMiddleware implements IMiddleware {
  validateFood = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const result = createFoodSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    next();
  };
}

const foodMiddleware = new FoodMiddleware();
export default foodMiddleware;
