import { Router } from "express";
import developerController from "./controller/controller";
import { userAuthMiddleware } from "../../middleware/userAuth";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const developerRouter = Router();

// All developer endpoints require a user JWT
developerRouter.use(userAuthMiddleware);

developerRouter.get("/keys/usage", tryCatchHelper(developerController.getUsage));
developerRouter.get("/keys",       tryCatchHelper(developerController.getKeys));
developerRouter.post("/keys",      tryCatchHelper(developerController.createKey));
developerRouter.delete("/keys/:id",tryCatchHelper(developerController.deleteKey));

export default developerRouter;
