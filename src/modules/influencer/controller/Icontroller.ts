import { Request, Response } from "express";

export default interface IController {
  createInfluencer: (req: Request, res: Response) => void;
  getInfluencers: (req: Request, res: Response) => void;
  getInfluencer: (req: Request, res: Response) => void;
  updateInfluencer: (req: Request, res: Response) => void;
  deleteInfluencer: (req: Request, res: Response) => void;
  //   getInfluencerFoods: (req: Request, res: Response) => void;
  //   getInfluencerVideos: (req: Request, res: Response) => void;
}
