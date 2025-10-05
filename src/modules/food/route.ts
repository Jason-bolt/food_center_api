import { Router } from "express";
import foodController from "./controller/controller";
import foodMiddleware from "./middleware/middleware";

const foodRouter = Router();

foodRouter.post("/", foodMiddleware.validateFood, foodController.createFood);
foodRouter.get("/", foodController.getFoods);
foodRouter.get("/:id", foodController.getFood);
foodRouter.get("/:id/influencers", foodController.getFoodInfluencers);
foodRouter.get("/:id/videos", foodController.getFoodVideos);
foodRouter.put("/:id", foodController.updateFood);
foodRouter.delete("/:id", foodController.deleteFood);

export default foodRouter;
