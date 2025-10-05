import { Request, Response } from "express";

export default interface IController {
  createFood: (req: Request, res: Response) => void;
  getFoods: (req: Request, res: Response) => void;
  getFood: (req: Request, res: Response) => void;
  getFoodInfluencers: (req: Request, res: Response) => void;
  getFoodVideos: (req: Request, res: Response) => void;
  updateFood: (req: Request, res: Response) => void;
  deleteFood: (req: Request, res: Response) => void;
}
