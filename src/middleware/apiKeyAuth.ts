import { Request, Response, NextFunction } from "express";
import ApiKeyModel, { firstOfNextMonth } from "../../config/db/models/ApiKeyModel";
import { type AuthenticatedRequest } from "./userAuth";
import logger from "../../utils/logger";

export interface ApiKeyRequest extends Request {
  apiKeyDoc?: InstanceType<typeof ApiKeyModel>;
}

/**
 * Authenticates requests via the `x-fc-api-key` header.
 * - Finds the key document, resets the monthly counter if past `resetAt`
 * - Enforces `monthlyLimit`
 * - Attaches `apiKeyDoc` and `userId` to the request on success
 */
export const apiKeyAuthMiddleware = async (
  req: ApiKeyRequest & AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const rawKey = req.headers["x-fc-api-key"] as string | undefined;
  if (!rawKey) { next(); return; } // no key present — let other auth handle it

  const now = new Date();

  // Reset counter if the billing month has rolled over
  const keyDoc = await ApiKeyModel.findOneAndUpdate(
    { key: rawKey, resetAt: { $lte: now } },
    { $set: { usedThisMonth: 0, resetAt: firstOfNextMonth() } },
    { new: true },
  ) ?? await ApiKeyModel.findOne({ key: rawKey });

  if (!keyDoc) {
    res.status(401).json({ error: "invalid_api_key", message: "API key not recognised." });
    return;
  }

  if (keyDoc.usedThisMonth >= keyDoc.monthlyLimit) {
    res.status(429).json({
      error: "monthly_limit_reached",
      message: `You've used all ${keyDoc.monthlyLimit} requests for this month. Upgrade your API plan to continue.`,
      plan: keyDoc.plan,
      limit: keyDoc.monthlyLimit,
      used: keyDoc.usedThisMonth,
    });
    return;
  }

  // Increment usage counter
  await ApiKeyModel.findByIdAndUpdate(keyDoc._id, { $inc: { usedThisMonth: 1 } });

  req.apiKeyDoc = keyDoc;
  req.userId = keyDoc.userId.toString();
  req.userPlan = "free"; // API key users are not on the Pro subscription plan

  logger.debug({ keyId: keyDoc._id, plan: keyDoc.plan }, "[ApiKeyAuth]: Request authorised");
  next();
};
