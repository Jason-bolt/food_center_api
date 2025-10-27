import IController from "./Icontroller";
import { Request, Response } from "express";
import { InfluencerService, influencerService } from "../service/service";
import {
  deleteRedisData,
  getRedisData,
  setRedisData,
} from "../../../../utils/services/redis";
import { InsertInfluencerFoodType } from "../../../../utils/types/InfluencerTypes";
import logger from "../../../../utils/logger";

class InfluencerController implements IController {
  constructor(private readonly influencerService: InfluencerService) {}

  createInfluencer = async (req: Request, res: Response): Promise<void> => {
    const influencer = req.body as InsertInfluencerFoodType;
    const newInfluencer = await this.influencerService.createInfluencer(
      influencer
    );
    logger.debug(
      { newInfluencer },
      "[InfluencerController - createInfluencer]: Created new influencer data"
    );
    res.status(201).json(newInfluencer);
  };

  getInfluencers = async (req: Request, res: Response): Promise<void> => {
    let influencers = await getRedisData("influencers:unpaginated");
    if (!influencers) {
      influencers = await this.influencerService.getInfluencers();
      await setRedisData("influencers:unpaginated", influencers);
    }
    logger.debug(
      { influencersCount: influencers?.length || 0 },
      "[InfluencerController - getInfluencers]: Fetched influencers"
    );
    res.status(200).json(influencers);
  };

  getInfluencer = async (req: Request, res: Response): Promise<void> => {
    let influencer = await getRedisData(`influencers:${req.params.id}`);
    if (!influencer) {
      influencer = await this.influencerService.getInfluencer(req.params.id);
      await setRedisData(`influencers:${req.params.id}`, influencer);
    }
    if (!influencer) {
      logger.info(
        { influencerId: req.params.id },
        "[InfluencerController - getInfluencer]: Influencer not found"
      );
      res.status(404).json({ message: "Influencer not found" });
      return;
    }
    logger.debug(
      { influencer, influencerId: req.params.id },
      "[InfluencerController - getInfluencer]: Fetched influencer"
    );
    res.status(200).json(influencer);
  };

  updateInfluencer = async (req: Request, res: Response): Promise<void> => {
    const influencer = req.body as InsertInfluencerFoodType;
    const updatedInfluencer = await this.influencerService.updateInfluencer(
      req.params.id,
      influencer
    );
    await deleteRedisData(`influencers:${req.params.id}`);
    await setRedisData(`influencers:${req.params.id}`, updatedInfluencer);
    logger.debug(
      { updatedInfluencer, influencerId: req.params.id },
      "[InfluencerController - updateInfluencer]: Updated influencer"
    );
    res.status(200).json(updatedInfluencer);
  };

  deleteInfluencer = async (req: Request, res: Response): Promise<void> => {
    await this.influencerService.deleteInfluencer(req.params.id);
    await deleteRedisData(`influencers:${req.params.id}`);
    logger.debug(
      { influencerId: req.params.id },
      "[InfluencerController - deleteInfluencer]: Deleted influencer"
    );
    res.status(200).json({ message: "Influencer deleted successfully" });
  };

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
}

const influencerController = new InfluencerController(influencerService);
export default influencerController;
