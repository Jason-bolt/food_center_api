/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";

const tryCatchHelper =
  (func: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await func(req, res, next);
    } catch (error: any) {
      // Mongoose CastError means a route param is not a valid ObjectId
      if (error?.name === "CastError" && error?.kind === "ObjectId") {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

export default tryCatchHelper;
