import { FoodService, foodService } from "../service/service";
import IController from "./Icontroller";
import { Request, Response } from "express";
import { FoodType } from "../../../../config/db/models/FoodModel";

class FoodController implements IController {
  constructor(private readonly foodService: FoodService) {}

  createFood = async (req: Request, res: Response) => {
    const food = req.body as Partial<FoodType>;
    const newFood = await this.foodService.createFood(food);
    res.status(201).json(newFood);
  };

  getFoods = async (req: Request, res: Response) => {
    const foodResponse = await this.foodService.getFoods(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );
    res.status(200).json({
      data: foodResponse.foods,
      totalpages: foodResponse.totalpages,
      page: foodResponse.page,
      totalItems: foodResponse.totalItems,
    });
  };

  getFood = async (req: Request, res: Response) => {
    const food = await this.foodService.getFood(req.params.id);
    res.status(200).json(food);
  };

  getFoodInfluencers = async (req: Request, res: Response) => {
    const foodInfluencers = await this.foodService.getFoodInfluencers(
      req.params.id
    );
    res.status(200).json(foodInfluencers);
  };

  getFoodVideos = async (req: Request, res: Response) => {
    const foodVideos = await this.foodService.getFoodVideos(req.params.id);
    res.status(200).json(foodVideos);
  };

  updateFood = async (req: Request, res: Response) => {
    const food = req.body;
    const updatedFood = await this.foodService.updateFood(req.params.id, food);
    res.status(200).json(updatedFood);
  };

  deleteFood = async (req: Request, res: Response) => {
    await this.foodService.deleteFood(req.params.id);
    res.status(200).json({ message: "Food deleted successfully" });
  };
}

const foodController = new FoodController(foodService as FoodService);
export default foodController;
