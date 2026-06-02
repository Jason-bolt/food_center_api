import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type AuthenticatedRequest } from "./userAuth";

/**
 * Like userAuthMiddleware but never rejects — simply attaches userId if a
 * valid Bearer token is present, otherwise continues without one.
 */
export const optionalUserAuthMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (authHeader?.startsWith("Bearer ") && secret) {
    try {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, secret) as { userId: string; plan: string };
      req.userId = payload.userId;
      req.userPlan = payload.plan;
    } catch {
      // Invalid token — ignore and continue as unauthenticated
    }
  }

  next();
};
