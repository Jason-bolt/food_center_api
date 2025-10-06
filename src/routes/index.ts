import { Router } from "express";
import foodRouter from "../modules/food/route";
import uploadRouter from "../modules/upload/route";
import influencerRouter from "../modules/influencer/route";

const router = Router();

router.use("/foods", foodRouter);
router.use("/upload", uploadRouter);
router.use("/influencers", influencerRouter);

export default router;