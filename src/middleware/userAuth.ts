import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../../utils/logger";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userPlan?: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

export const userAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!JWT_SECRET) {
    logger.error("[userAuth]: JWT_SECRET env var is not set");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; plan: string };
    req.userId = payload.userId;
    req.userPlan = payload.plan;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
