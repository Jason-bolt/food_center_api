import { Router } from "express";
import foodController from "./controller/controller";
import foodMiddleware from "./middleware/middleware";
import tryCatchHelper from "../../../utils/tryCatchHelper";
import authMiddleware from "../../middleware/auth";

const foodRouter = Router();

foodRouter.post(
  "/",
  authMiddleware,
  tryCatchHelper(foodMiddleware.validateFood),
  tryCatchHelper(foodMiddleware.isUniqueFoodName),
  tryCatchHelper(foodController.createFood)
);
foodRouter.get("/", tryCatchHelper(foodController.getFoods));
foodRouter.get(
  "/all/items/nonpaginated",
  tryCatchHelper(foodController.getFoodsNonPaginated)
);
foodRouter.get(
  "/:id",
  tryCatchHelper(foodMiddleware.doesFoodExist),
  tryCatchHelper(foodController.getFood)
);
foodRouter.put(
  "/:id",
  authMiddleware,
  tryCatchHelper(foodMiddleware.validateFood),
  tryCatchHelper(foodMiddleware.doesFoodExist),
  tryCatchHelper(foodController.updateFood)
);
foodRouter.get(
  "/:id/influencers",
  tryCatchHelper(foodMiddleware.doesFoodExist),
  tryCatchHelper(foodController.getFoodInfluencers)
);
foodRouter.get(
  "/:id/videos",
  tryCatchHelper(foodMiddleware.doesFoodExist),
  tryCatchHelper(foodController.getFoodVideos)
);
foodRouter.delete(
  "/:id",
  authMiddleware,
  tryCatchHelper(foodMiddleware.doesFoodExist),
  tryCatchHelper(foodController.deleteFood)
);

export default foodRouter;
