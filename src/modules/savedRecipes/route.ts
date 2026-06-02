import { Router } from "express";
import { userAuthMiddleware } from "../../middleware/userAuth";
import savedRecipesController from "./controller/controller";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const savedRecipesRouter = Router();

savedRecipesRouter.use(userAuthMiddleware);

// Collection routes must come before /:id to avoid being matched as an id
savedRecipesRouter.get("/collections", tryCatchHelper(savedRecipesController.getCollections));
savedRecipesRouter.post("/collections", tryCatchHelper(savedRecipesController.createCollection));
savedRecipesRouter.put("/collections/:id", tryCatchHelper(savedRecipesController.renameCollection));
savedRecipesRouter.delete("/collections/:id", tryCatchHelper(savedRecipesController.deleteCollection));

savedRecipesRouter.get("/", tryCatchHelper(savedRecipesController.getAll));
savedRecipesRouter.post("/", tryCatchHelper(savedRecipesController.save));
savedRecipesRouter.delete("/:id", tryCatchHelper(savedRecipesController.delete));
savedRecipesRouter.put("/:id/collection", tryCatchHelper(savedRecipesController.moveToCollection));

export default savedRecipesRouter;
