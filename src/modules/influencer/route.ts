import { Router } from "express";
import influencerController from "./controller/controller";
import influencerMiddleware from "./middleware/middleware";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const influencerRouter = Router();

influencerRouter.post(
  "/",
  influencerMiddleware.validateInfluencer,
  tryCatchHelper(influencerMiddleware.isUniqueInfluencerName),
  tryCatchHelper(influencerController.createInfluencer)
);
influencerRouter.get("/", tryCatchHelper(influencerController.getInfluencers));
influencerRouter.get(
  "/:id",
  tryCatchHelper(influencerController.getInfluencer)
);
influencerRouter.put(
  "/:id",
  influencerMiddleware.validateInfluencer,
  tryCatchHelper(influencerMiddleware.doesInfluencerExist),
  tryCatchHelper(influencerController.updateInfluencer)
);
influencerRouter.delete(
  "/:id",
  tryCatchHelper(influencerMiddleware.doesInfluencerExist),
  tryCatchHelper(influencerController.deleteInfluencer)
);
// influencerRouter.get("/:id/foods", tryCatchHelper(influencerController.getInfluencerFoods));
// influencerRouter.get("/:id/videos", tryCatchHelper(influencerController.getInfluencerVideos));

export default influencerRouter;
