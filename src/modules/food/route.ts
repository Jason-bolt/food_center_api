import { Router } from "express";
import foodController from "./controller/controller";
import foodMiddleware from "./middleware/middleware";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const foodRouter = Router();

foodRouter.post(
  "/",
  foodMiddleware.validateFood,
  tryCatchHelper(foodController.createFood)
);
foodRouter.get("/", tryCatchHelper(foodController.getFoods));
foodRouter.get("/:id", tryCatchHelper(foodController.getFood));
foodRouter.put("/:id", tryCatchHelper(foodController.updateFood));
foodRouter.get(
  "/:id/influencers",
  tryCatchHelper(foodController.getFoodInfluencers)
);
foodRouter.get("/:id/videos", tryCatchHelper(foodController.getFoodVideos));
foodRouter.delete("/:id", tryCatchHelper(foodController.deleteFood));

export default foodRouter;
