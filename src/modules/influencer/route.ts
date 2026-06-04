import { Router } from "express";
import influencerController from "./controller/controller";
import featuredController from "./controller/featuredController";
import influencerMiddleware from "./middleware/middleware";
import tryCatchHelper from "../../../utils/tryCatchHelper";
import authMiddleware from "../../middleware/auth";

const influencerRouter = Router();

// ── Featured slots (must be before /:id to avoid param clash) ─────────────────
influencerRouter.get("/featured-slots/active", tryCatchHelper(featuredController.getActiveFeaturedSlot));
influencerRouter.get("/featured-slots", authMiddleware, tryCatchHelper(featuredController.getAllSlots));
influencerRouter.post("/featured-slots", authMiddleware, tryCatchHelper(featuredController.createSlot));
influencerRouter.put("/featured-slots/:id", authMiddleware, tryCatchHelper(featuredController.updateSlot));
influencerRouter.delete("/featured-slots/:id", authMiddleware, tryCatchHelper(featuredController.deleteSlot));

// ── Public inquiry form ───────────────────────────────────────────────────────
influencerRouter.post("/inquiry", tryCatchHelper(featuredController.submitInquiry));

// ── Standard influencer CRUD ──────────────────────────────────────────────────
influencerRouter.post(
  "/",
  authMiddleware,
  tryCatchHelper(influencerMiddleware.validateInfluencer),
  tryCatchHelper(influencerMiddleware.isUniqueInfluencerName),
  tryCatchHelper(influencerController.createInfluencer),
);
influencerRouter.get("/", tryCatchHelper(influencerController.getInfluencers));
influencerRouter.get("/:id", tryCatchHelper(influencerController.getInfluencer));
influencerRouter.put(
  "/:id",
  authMiddleware,
  tryCatchHelper(influencerMiddleware.validateInfluencer),
  tryCatchHelper(influencerMiddleware.doesInfluencerExist),
  tryCatchHelper(influencerController.updateInfluencer),
);
influencerRouter.delete(
  "/:id",
  authMiddleware,
  tryCatchHelper(influencerMiddleware.doesInfluencerExist),
  tryCatchHelper(influencerController.deleteInfluencer),
);

export default influencerRouter;
