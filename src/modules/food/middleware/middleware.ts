import IMiddleware from "./Imiddleware";
import { createFoodSchema } from "../../../../config/zod/schemas/food";
import { NextFunction, Request, Response } from "express";
import FoodModel from "../../../../config/db/models/FoodModel";

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

  doesFoodExist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const food = await FoodModel.findById(req.params?.id || req.body?.id);
    if (!food) {
      res.status(404).json({ error: "Food does not exist" });
      return;
    }
    next();
  };

  isUniqueFoodName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const food = await FoodModel.findOne({ name: req.body?.name });
    if (food) {
      res.status(400).json({ error: "Food name is already taken" });
      return;
    }
    next();
  };
}

const foodMiddleware = new FoodMiddleware();
export default foodMiddleware;
