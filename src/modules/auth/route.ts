import { Router } from "express";
import authController from "./controller/controller";
import { userAuthMiddleware } from "../../middleware/userAuth";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const authRouter = Router();

authRouter.post("/register", tryCatchHelper(authController.register));
authRouter.post("/login", tryCatchHelper(authController.login));
authRouter.get("/me", userAuthMiddleware, tryCatchHelper(authController.getMe));

export default authRouter;
