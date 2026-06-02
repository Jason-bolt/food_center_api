import { Router } from "express";
import { userAuthMiddleware } from "../../middleware/userAuth";
import pantryController from "./controller/controller";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const pantryRouter = Router();

pantryRouter.use(userAuthMiddleware);

pantryRouter.get("/",              tryCatchHelper(pantryController.get));
pantryRouter.put("/",              tryCatchHelper(pantryController.setAll));
pantryRouter.post("/ingredient",   tryCatchHelper(pantryController.addOne));
pantryRouter.delete("/ingredient", tryCatchHelper(pantryController.removeOne));

export default pantryRouter;
