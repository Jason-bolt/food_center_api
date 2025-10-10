import { Request, Response, NextFunction } from "express";

const tryCatchHelper =
  (func: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await func(req, res, next);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

export default tryCatchHelper;
