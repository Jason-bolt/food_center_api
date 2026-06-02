import { Router } from "express";
import trendingController from "./controller/controller";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const trendingRouter = Router();

trendingRouter.get("/", tryCatchHelper(trendingController.get));

export default trendingRouter;
