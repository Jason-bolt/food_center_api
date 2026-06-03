import { Response, NextFunction } from "express";
import { type AuthenticatedRequest } from "./userAuth";
import { incrExpireAtMidnight } from "../../utils/services/redis";
import UserModel from "../../config/db/models/UserModel";
import logger from "../../utils/logger";

const FREE_DAILY_LIMIT = 3;

export const freemiumCheckMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.userId;
  const plan = req.userPlan;

  // Guests are handled by the existing IP-based rate limiter
  if (!userId) { next(); return; }

  // Pro users have unlimited access
  if (plan === "pro") { next(); return; }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = `ratelimit:recipes:${userId}:${today}`;

  try {
    // Peek at the current count without incrementing yet
    const existing = await incrExpireAtMidnight(key);

    if (existing <= FREE_DAILY_LIMIT) {
      res.setHeader("X-Free-Generations-Used", existing);
      res.setHeader("X-Free-Generations-Limit", FREE_DAILY_LIMIT);
      next();
      return;
    }

    // Over daily limit — try spending a credit atomically (don't touch the Redis counter)
    const updated = await UserModel.findOneAndUpdate(
      { _id: userId, credits: { $gt: 0 } },
      { $inc: { credits: -1 } },
      { new: true },
    );

    if (updated) {
      logger.debug({ userId, credits: updated.credits }, "[FreemiumCheck]: Credit spent");
      res.setHeader("X-Credits-Remaining", updated.credits);
      next();
      return;
    }

    // No credits either — block
    res.status(429).json({
      error: "daily_limit_reached",
      message: `You've used your ${FREE_DAILY_LIMIT} free recipes today. Upgrade to Pro or buy credits to keep going.`,
      limit: FREE_DAILY_LIMIT,
      plan: "free",
    });
  } catch (err) {
    logger.error({ err }, "[FreemiumCheck]: Redis or DB error — blocking to avoid silent over-grant");
    res.status(503).json({ error: "Service temporarily unavailable. Please try again." });
  }
};
