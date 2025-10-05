import { Router } from "express";
import foodRouter from "../modules/food/route";
import uploadRouter from "../modules/upload/route";

const router = Router();

router.use("/foods", foodRouter);
router.use("/upload", uploadRouter);

export default router;