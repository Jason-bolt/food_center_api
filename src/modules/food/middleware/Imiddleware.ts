import { NextFunction, Request, Response } from "express";

export default interface IMiddleware {
  validateFood: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  doesFoodExist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  isUniqueFoodName: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}