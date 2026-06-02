import { Router } from "express";
import { userAuthMiddleware } from "../../middleware/userAuth";
import mealPlanController from "./controller/controller";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const mealPlanRouter = Router();

mealPlanRouter.use(userAuthMiddleware);

mealPlanRouter.get("/", tryCatchHelper(mealPlanController.get));
mealPlanRouter.put("/slot", tryCatchHelper(mealPlanController.setSlot));
mealPlanRouter.delete("/slot", tryCatchHelper(mealPlanController.clearSlot));

export default mealPlanRouter;
