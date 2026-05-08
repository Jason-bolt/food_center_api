import { FoodService, foodService } from "../service/service";
import IController from "./Icontroller";
import { Request, Response } from "express";
import { FoodType } from "../../../../config/db/models/FoodModel";
import {
  deleteRedisData,
  deleteRedisByPattern,
  getRedisData,
  setRedisData,
} from "../../../../utils/services/redis";
import logger from "../../../../utils/logger";

// List caches use a dedicated prefix so they can be bulk-invalidated without touching
// individual-food caches (foods:<id>), which have independent TTLs.
const LIST_CACHE_PREFIX = "foods:list:";
const NONPAGINATED_KEY = "foods:nonpaginated";

const invalidateFoodListCaches = async (): Promise<void> => {
  await Promise.all([
    deleteRedisByPattern(`${LIST_CACHE_PREFIX}*`),
    deleteRedisData(NONPAGINATED_KEY),
  ]);
};

class FoodController implements IController {
  constructor(private readonly foodService: FoodService) {}

  createFood = async (req: Request, res: Response) => {
    const food = req.body as Partial<FoodType>;
    const newFood = await this.foodService.createFood(food);
    await invalidateFoodListCaches();
    logger.debug({ food: newFood }, "[FoodController - createFood]: Created new food");
    res.status(201).json(newFood);
  };

  getFoods = async (req: Request, res: Response) => {
    const cacheParams = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search as string | undefined,
      country: req.query.country as string | undefined,
      region: req.query.region as string | undefined,
    };

    logger.debug({ foodsQuery: cacheParams }, "[FoodController - getFoods]: Query params");

    const cacheKey = `${LIST_CACHE_PREFIX}${JSON.stringify(cacheParams)}`;
    let foodResponse = await getRedisData(cacheKey);

    if (!foodResponse) {
      foodResponse = await this.foodService.getFoods(
        cacheParams.page,
        cacheParams.limit,
        cacheParams.search,
        cacheParams.country,
        cacheParams.region,
      );
      await setRedisData(cacheKey, foodResponse);
    }

    logger.debug(
      { count: foodResponse.foods?.length },
      "[FoodController - getFoods]: Returning foods",
    );

    res.status(200).json({
      data: foodResponse.foods,
      totalpages: foodResponse.totalpages,
      page: foodResponse.page,
      totalItems: foodResponse.totalItems,
    });
  };

  getFoodsNonPaginated = async (req: Request, res: Response) => {
    let foods = await getRedisData(NONPAGINATED_KEY);
    if (!foods) {
      foods = await this.foodService.getFoodsNonPaginated();
      await setRedisData(NONPAGINATED_KEY, foods, 60);
    }
    logger.debug({ count: foods?.length }, "[FoodController - getFoodsNonPaginated]: Returning");
    res.status(200).json(foods);
  };

  getFood = async (req: Request, res: Response) => {
    const key = `foods:${req.params.id}`;
    let food = await getRedisData(key);
    if (!food) {
      food = await this.foodService.getFood(req.params.id as string);
      if (food) await setRedisData(key, food);
    }
    if (!food) {
      res.status(404).json({ message: "Food not found" });
      return;
    }
    logger.debug({ foodId: req.params.id }, "[FoodController - getFood]: Returning");
    res.status(200).json(food);
  };

  getFoodInfluencers = async (req: Request, res: Response) => {
    const influencerId = (req.query?.influencerId as string) ?? "";
    const key = `foods:${req.params.id}:influencers:${influencerId}`;
    let foodInfluencers = await getRedisData(key);
    if (!foodInfluencers) {
      foodInfluencers = await this.foodService.getFoodInfluencers(
        req.params.id as string,
        influencerId || undefined,
      );
      if (foodInfluencers) await setRedisData(key, foodInfluencers);
    }
    if (!foodInfluencers) {
      res.status(404).json({ message: "Food influencers not found" });
      return;
    }
    res.status(200).json(foodInfluencers);
  };

  getFoodVideos = async (req: Request, res: Response) => {
    const key = `foods:${req.params.id}:videos`;
    let foodVideos = await getRedisData(key);
    if (!foodVideos) {
      foodVideos = await this.foodService.getFoodVideos(req.params.id as string);
      if (foodVideos) await setRedisData(key, foodVideos);
    }
    if (!foodVideos) {
      res.status(404).json({ message: "Food videos not found" });
      return;
    }
    res.status(200).json(foodVideos);
  };

  updateFood = async (req: Request, res: Response) => {
    const food = req.body;
    const id = req.params.id as string;
    logger.debug({ food, foodId: id }, "[FoodController - updateFood]: Updating");
    const updatedFood = await this.foodService.updateFood(id, food);
    await Promise.all([
      setRedisData(`foods:${id}`, updatedFood),
      invalidateFoodListCaches(),
    ]);
    logger.debug({ foodId: id }, "[FoodController - updateFood]: Updated and cache refreshed");
    res.status(200).json(updatedFood);
  };

  deleteFood = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    logger.debug({ foodId: id }, "[FoodController - deleteFood]: Deleting");
    await this.foodService.deleteFood(id);
    await Promise.all([
      deleteRedisData(`foods:${id}`),
      deleteRedisByPattern(`foods:${id}:*`),
      invalidateFoodListCaches(),
    ]);
    logger.debug({ foodId: id }, "[FoodController - deleteFood]: Deleted and cache cleared");
    res.status(200).json({ message: "Food deleted successfully" });
  };
}

const foodController = new FoodController(foodService as FoodService);
export default foodController;
