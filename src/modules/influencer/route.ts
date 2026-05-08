import { Router } from "express";
import influencerController from "./controller/controller";
import influencerMiddleware from "./middleware/middleware";
import tryCatchHelper from "../../../utils/tryCatchHelper";
import authMiddleware from "../../middleware/auth";

const influencerRouter = Router();

influencerRouter.post(
  "/",
  authMiddleware,
  tryCatchHelper(influencerMiddleware.validateInfluencer),
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
  authMiddleware,
  tryCatchHelper(influencerMiddleware.validateInfluencer),
  tryCatchHelper(influencerMiddleware.doesInfluencerExist),
  tryCatchHelper(influencerController.updateInfluencer)
);
influencerRouter.delete(
  "/:id",
  authMiddleware,
  tryCatchHelper(influencerMiddleware.doesInfluencerExist),
  tryCatchHelper(influencerController.deleteInfluencer)
);
export default influencerRouter;
