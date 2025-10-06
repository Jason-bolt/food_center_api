import { Router } from "express";
import influencerController from "./controller/controller";
import influencerMiddleware from "./middleware/middleware";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const influencerRouter = Router();

influencerRouter.post(
  "/",
  influencerMiddleware.validateInfluencer,
  tryCatchHelper(influencerController.createInfluencer)
);
// influencerRouter.get(
//   "/",
//   tryCatchHelper(influencerController.getInfluencers)
// );
// influencerRouter.get("/:id", tryCatchHelper(influencerController.getInfluencer));
// influencerRouter.get("/:id/foods", tryCatchHelper(influencerController.getInfluencerFoods));
// influencerRouter.get("/:id/videos", tryCatchHelper(influencerController.getInfluencerVideos));
// influencerRouter.put("/:id", tryCatchHelper(influencerController.updateInfluencer));
// influencerRouter.delete("/:id", tryCatchHelper(influencerController.deleteInfluencer));

export default influencerRouter;
