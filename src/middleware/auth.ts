import { Request, Response, NextFunction } from "express";
import logger from "../../utils/logger";

// Read once at startup so a misconfigured server fails on the first request
// rather than silently passing auth checks.
const apiSecret = process.env.API_SECRET;

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!apiSecret) {
    logger.error("[auth]: API_SECRET env var is not set — rejecting all requests");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const authHeader = req.headers["authorization"];
  const apiKey = req.headers["x-api-key"] as string | undefined;

  const token = apiKey ?? (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);

  if (!token) {
    res.status(401).json({ error: "Missing credentials" });
    return;
  }

  if (token !== apiSecret) {
    logger.warn({ ip: req.ip }, "[auth]: Invalid API key attempt");
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
};

export default authMiddleware;
