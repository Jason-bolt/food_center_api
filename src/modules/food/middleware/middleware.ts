import IMiddleware from "./Imiddleware";
import { createFoodSchema } from "../../../../config/zod/schemas/food";
import { NextFunction, Request, Response } from "express";
import FoodModel from "../../../../config/db/models/FoodModel";
import logger from "../../../../utils/logger";

class FoodMiddleware implements IMiddleware {
  validateFood = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const result = createFoodSchema.safeParse(req.body);
    if (!result.success) {
      logger.error(req.body, "[FoodMiddleware - validateFood]: Bad food data");
      res.status(400).json({ error: result.error.message });
      return;
    }

    logger.debug(req.body, "[FoodMiddleware - validateFood]: Raw food data");
    next();
  };

  doesFoodExist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const food = await FoodModel.findById(req.params?.id || req.body?.id);
    if (!food) {
      logger.error(
        { foodId: req.params?.id || req.body?.id },
        "[FoodMiddleware - doesFoodExist]: Food with ID does not exist"
      );
      res.status(404).json({ error: "Food does not exist" });
      return;
    }
    logger.debug(
      { foodId: req.params?.id || req.body?.id },
      "[FoodMiddleware - doesFoodExist]: Food with ID is valid"
    );
    next();
  };

  isUniqueFoodName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const food = await FoodModel.findOne({ name: req.body?.name });
    if (food) {
      logger.error(
        { foodName: req.body?.name },
        "[FoodMiddleware - isUniqueFoodName]: Food name is already taken"
      );
      res.status(400).json({ error: "Food name is already taken" });
      return;
    }
    logger.debug(
      { foodName: req.body?.name },
      "[FoodMiddleware - isUniqueFoodName]: Food name is valid"
    );

    next();
  };
}

const foodMiddleware = new FoodMiddleware();
export default foodMiddleware;
