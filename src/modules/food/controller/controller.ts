import { FoodService, foodService } from "../service/service";
import IController from "./Icontroller";
import { Request, Response } from "express";
import { FoodType } from "../../../../config/db/models/FoodModel";
import {
  deleteRedisData,
  getRedisData,
  setRedisData,
} from "../../../../utils/services/redis";

class FoodController implements IController {
  constructor(private readonly foodService: FoodService) {}

  createFood = async (req: Request, res: Response) => {
    const food = req.body as Partial<FoodType>;
    const newFood = await this.foodService.createFood(food);
    res.status(201).json(newFood);
  };

  getFoods = async (req: Request, res: Response) => {
    let foodResponse = {
      foods: [] as FoodType[],
      totalpages: 0,
      page: 0,
      totalItems: 0,
    };

    const cacheParams = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query?.search as string,
      country: req.query?.country as string,
      region: req.query?.region as string,
    };
    foodResponse = await getRedisData(`foods:${JSON.stringify(cacheParams)}`);
    if (!foodResponse) {
      foodResponse = await this.foodService.getFoods(
        cacheParams.page,
        cacheParams.limit,
        cacheParams.search,
        cacheParams.country,
        cacheParams.region
      );
      await setRedisData(`foods:${JSON.stringify(cacheParams)}`, foodResponse);
    }

    if (foodResponse.foods.length === 0) {
      return res.status(404).json({
        data: [],
        totalpages: foodResponse.totalpages,
        page: foodResponse.page,
        totalItems: foodResponse.totalItems,
      });
    }
    res.status(200).json({
      data: foodResponse.foods,
      totalpages: foodResponse.totalpages,
      page: foodResponse.page,
      totalItems: foodResponse.totalItems,
    });
  };

  getFoodsNonPaginated = async (req: Request, res: Response) => {
    let foods = await getRedisData("foods:nonpaginated");
    if (!foods) {
      foods = await this.foodService.getFoodsNonPaginated();
      await setRedisData("foods:nonpaginated", foods, 30);
    }
    res.status(200).json(foods);
  };

  getFood = async (req: Request, res: Response) => {
    let food = await getRedisData(`foods:${req.params.id}`);
    if (!food) {
      food = await this.foodService.getFood(req.params.id);
      await setRedisData(`foods:${req.params.id}`, food);
    }
    if (!food) {
      res.status(404).json({ message: "Food not found" });
      return;
    }
    res.status(200).json(food);
  };

  getFoodInfluencers = async (req: Request, res: Response) => {
    let foodInfluencers = await getRedisData(
      `foods:${req.params.id}:influencers`
    );
    if (!foodInfluencers) {
      foodInfluencers = await this.foodService.getFoodInfluencers(
        req.params.id
      );
      await setRedisData(`foods:${req.params.id}:influencers`, foodInfluencers);
    }
    if (!foodInfluencers) {
      res.status(404).json({ message: "Food influencers not found" });
      return;
    }
    res.status(200).json(foodInfluencers);
  };

  getFoodVideos = async (req: Request, res: Response) => {
    let foodVideos = await getRedisData(`foods:${req.params.id}:videos`);
    if (!foodVideos) {
      foodVideos = await this.foodService.getFoodVideos(req.params.id);
      await setRedisData(`foods:${req.params.id}:videos`, foodVideos);
    }
    if (!foodVideos) {
      res.status(404).json({ message: "Food videos not found" });
      return;
    }
    res.status(200).json(foodVideos);
  };

  updateFood = async (req: Request, res: Response) => {
    const food = req.body;
    const updatedFood = await this.foodService.updateFood(req.params.id, food);
    await deleteRedisData(`foods:${req.params.id}`);
    await setRedisData(`foods:${req.params.id}`, updatedFood);
    res.status(200).json(updatedFood);
  };

  deleteFood = async (req: Request, res: Response) => {
    await this.foodService.deleteFood(req.params.id);
    await deleteRedisData(`foods:${req.params.id}`);
    await deleteRedisData(`foods:${req.params.id}:influencers`);
    await deleteRedisData(`foods:${req.params.id}:videos`);
    res.status(200).json({ message: "Food deleted successfully" });
  };
}

const foodController = new FoodController(foodService as FoodService);
export default foodController;
