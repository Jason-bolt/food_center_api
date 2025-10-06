import IController from "./Icontroller";
import { Request, Response } from "express";
import { InfluencerService, influencerService } from "../service/service";
import { InfluencerType } from "../../../../config/db/models/InfluencerModel";

class InfluencerController implements IController {
  constructor(private readonly influencerService: InfluencerService) {}

  createInfluencer = async (req: Request, res: Response): Promise<void> => {
    const influencer = req.body as Partial<InfluencerType>;
    const newInfluencer = await this.influencerService.createInfluencer(
      influencer
    );
    res.status(201).json(newInfluencer);
  };

//   getInfluencers = async (req: Request, res: Response): Promise<void> => {
//     const influencers = await this.influencerService.getInfluencers();
//     res.status(200).json(influencers);
//   };

//   getInfluencer = async (req: Request, res: Response): Promise<void> => {
//     const influencer = await this.influencerService.getInfluencer(
//       req.params.id
//     );
//     res.status(200).json(influencer);
//   };

//   getInfluencerFoods = async (req: Request, res: Response): Promise<void> => {
//     const influencerFoods = await this.influencerService.getInfluencerFoods(
//       req.params.id
//     );
//     res.status(200).json(influencerFoods);
//   };

//   getInfluencerVideos = async (req: Request, res: Response): Promise<void> => {
//     const influencerVideos = await this.influencerService.getInfluencerVideos(
//       req.params.id
//     );
//     res.status(200).json(influencerVideos);
//   };

//   updateInfluencer = async (req: Request, res: Response): Promise<void> => {
//     const influencer = req.body as Partial<InfluencerType>;
//     const updatedInfluencer = await this.influencerService.updateInfluencer(
//       req.params.id,
//       influencer
//     );
//     res.status(200).json(updatedInfluencer);
//   };

//   deleteInfluencer = async (req: Request, res: Response): Promise<void> => {
//     await this.influencerService.deleteInfluencer(req.params.id);
//     res.status(200).json({ message: "Influencer deleted successfully" });
//   };
}

const influencerController = new InfluencerController(influencerService);
export default influencerController;
