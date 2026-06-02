import { Router } from "express";
import editorialController from "./controller/controller";
import authMiddleware from "../../middleware/auth";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const editorialRouter = Router();

// Public — current week's editorial (or null)
editorialRouter.get("/active", tryCatchHelper(editorialController.getActive));

// Admin — full list + CRUD
editorialRouter.get(  "/",    authMiddleware, tryCatchHelper(editorialController.getAll));
editorialRouter.post( "/",    authMiddleware, tryCatchHelper(editorialController.create));
editorialRouter.put(  "/:id", authMiddleware, tryCatchHelper(editorialController.update));
editorialRouter.delete("/:id",authMiddleware, tryCatchHelper(editorialController.remove));

export default editorialRouter;
