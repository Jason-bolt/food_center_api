import { NextFunction, Request, Response } from "express";

export default interface IMiddleware {
  validateInfluencer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}