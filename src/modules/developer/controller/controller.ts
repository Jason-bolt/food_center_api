import { Response } from "express";
import ApiKeyModel, { API_PLANS, ApiPlan, firstOfNextMonth } from "../../../../config/db/models/ApiKeyModel";
import { type AuthenticatedRequest } from "../../../middleware/userAuth";
import logger from "../../../../utils/logger";

class DeveloperController {
  /** GET /developer/keys — list the user's API keys */
  getKeys = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const keys = await ApiKeyModel.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(keys);
  };

  /** POST /developer/keys — generate a new API key (max 3 per user) */
  createKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await ApiKeyModel.countDocuments({ userId: req.userId });
    if (count >= 3) {
      res.status(400).json({ error: "max_keys_reached", message: "You can have at most 3 API keys." });
      return;
    }

    const key = await ApiKeyModel.create({
      userId: req.userId,
      plan: "free",
      monthlyLimit: API_PLANS.free.monthlyLimit,
      resetAt: firstOfNextMonth(),
    });

    logger.info({ userId: req.userId, keyId: key._id }, "[Developer]: API key created");
    res.status(201).json(key);
  };

  /** DELETE /developer/keys/:id — revoke a key */
  deleteKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const key = await ApiKeyModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!key) { res.status(404).json({ error: "Key not found" }); return; }
    logger.info({ keyId: req.params.id }, "[Developer]: API key revoked");
    res.json({ message: "Key revoked" });
  };

  /** GET /developer/keys/usage — aggregated usage across all user's keys */
  getUsage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const keys = await ApiKeyModel.find({ userId: req.userId });
    const summary = keys.map((k) => ({
      id:           k._id,
      key:          `${k.key.slice(0, 8)}…${k.key.slice(-4)}`, // masked
      plan:         k.plan,
      label:        API_PLANS[k.plan as ApiPlan]?.label ?? k.plan,
      monthlyLimit: k.monthlyLimit,
      usedThisMonth:k.usedThisMonth,
      resetAt:      k.resetAt,
      percentUsed:  Math.min(100, Math.round((k.usedThisMonth / k.monthlyLimit) * 100)),
    }));
    res.json(summary);
  };
}

export default new DeveloperController();
