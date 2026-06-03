import { Router, Request, Response, NextFunction } from "express";
import billingController from "./controller/controller";
import { userAuthMiddleware } from "../../middleware/userAuth";
import tryCatchHelper from "../../../utils/tryCatchHelper";

const billingRouter = Router();

billingRouter.post("/checkout", userAuthMiddleware, tryCatchHelper(billingController.createCheckout));
billingRouter.post("/credits", userAuthMiddleware, tryCatchHelper(billingController.createCreditsCheckout));
billingRouter.post("/portal", userAuthMiddleware, tryCatchHelper(billingController.createPortal));

// Raw-body webhook — body is attached by the express.raw() middleware registered in index.ts
billingRouter.post(
  "/webhook",
  (req: Request & { rawBody?: Buffer }, _res: Response, next: NextFunction) => {
    // express.raw attaches to req.body as Buffer; copy it so the controller can access it
    req.rawBody = req.body as unknown as Buffer;
    next();
  },
  tryCatchHelper(billingController.handleWebhook),
);

export default billingRouter;
