import IController from "./Icontroller";
import { Request, Response } from "express";
import { InfluencerService, influencerService } from "../service/service";
import { InsertInfluencerFoodType } from "../../../../utils/types/InfluencerTypes";
import {
  deleteRedisData,
  getRedisData,
  setRedisData,
} from "../../../../utils/services/redis";
import logger from "../../../../utils/logger";

const UNPAGINATED_KEY = "influencers:unpaginated";

const invalidateInfluencerListCaches = async (): Promise<void> => {
  await deleteRedisData(UNPAGINATED_KEY);
};

class InfluencerController implements IController {
  constructor(private readonly influencerService: InfluencerService) {}

  createInfluencer = async (req: Request, res: Response): Promise<void> => {
    const influencer = req.body as InsertInfluencerFoodType;
    const newInfluencer = await this.influencerService.createInfluencer(influencer);
    logger.debug(
      { newInfluencer },
      "[InfluencerController - createInfluencer]: Created new influencer",
    );
    res.status(201).json(newInfluencer);
  };

  getInfluencers = async (req: Request, res: Response): Promise<void> => {
    let influencers = await getRedisData(UNPAGINATED_KEY);
    if (!influencers) {
      influencers = await this.influencerService.getInfluencers();
      await setRedisData(UNPAGINATED_KEY, influencers);
    }
    logger.debug(
      { influencersCount: influencers?.length || 0 },
      "[InfluencerController - getInfluencers]: Fetched influencers",
    );
    res.status(200).json(influencers);
  };

  getInfluencer = async (req: Request, res: Response): Promise<void> => {
    const key = `influencers:${req.params.id as string}`;
    let influencer = await getRedisData(key);
    if (!influencer) {
      influencer = await this.influencerService.getInfluencer(req.params.id as string);
      if (influencer) await setRedisData(key, influencer);
    }
    if (!influencer) {
      logger.info(
        { influencerId: req.params.id as string },
        "[InfluencerController - getInfluencer]: Influencer not found",
      );
      res.status(404).json({ message: "Influencer not found" });
      return;
    }
    logger.debug(
      { influencerId: req.params.id as string },
      "[InfluencerController - getInfluencer]: Returning influencer",
    );
    res.status(200).json(influencer);
  };

  updateInfluencer = async (req: Request, res: Response): Promise<void> => {
    const influencer = req.body as InsertInfluencerFoodType;
    const updatedInfluencer = await this.influencerService.updateInfluencer(
      req.params.id as string,
      influencer,
    );
    await Promise.all([
      setRedisData(`influencers:${req.params.id as string}`, updatedInfluencer),
      invalidateInfluencerListCaches(),
    ]);
    logger.debug(
      { influencerId: req.params.id as string },
      "[InfluencerController - updateInfluencer]: Updated influencer",
    );
    res.status(200).json(updatedInfluencer);
  };

  deleteInfluencer = async (req: Request, res: Response): Promise<void> => {
    await this.influencerService.deleteInfluencer(req.params.id as string);
    await Promise.all([
      deleteRedisData(`influencers:${req.params.id as string}`),
      invalidateInfluencerListCaches(),
    ]);
    logger.debug(
      { influencerId: req.params.id as string },
      "[InfluencerController - deleteInfluencer]: Deleted influencer",
    );
    res.status(200).json({ message: "Influencer deleted successfully" });
  };
}

const influencerController = new InfluencerController(influencerService);
export default influencerController;
