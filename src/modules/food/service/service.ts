import FoodModel, { FoodType } from "../../../../config/db/models/FoodModel";
import InfluencerFoodModel, {
  InfluencerFoodType,
} from "../../../../config/db/models/InfluencerFoodModel";
import IService from "./Iservice";

class FoodService implements IService {
  createFood = async (food: Partial<FoodType>) => {
    try {
      const newFood = new FoodModel(food);
      await newFood.save();
      return newFood as FoodType;
    } catch (error) {
      throw new Error("Failed to create food");
    }
  };

  getFoods = async (page: number, limit: number) => {
    try {
      const foods = await FoodModel.find();
      const foodCount = await FoodModel.countDocuments();
      return {
        foods,
        totalpages: Math.ceil(foodCount / limit),
        page,
        totalItems: foodCount,
      };
    } catch (error) {
      throw new Error("Failed to get foods");
    }
  };

  getFood = async (id: string) => {
    try {
      const food = await FoodModel.findById(id);
      return food as FoodType;
    } catch (error) {
      throw new Error("Failed to get food");
    }
  };

  getFoodInfluencers = async (foodId: string) => {
    try {
      const foodInfluencers = await InfluencerFoodModel.find({ foodId });
      return foodInfluencers as InfluencerFoodType[];
    } catch (error) {
      throw new Error("Failed to get food influencers");
    }
  };

  getFoodVideos = async (foodId: string) => {
    try {
      const foodVideos = await InfluencerFoodModel.find({ foodId });
      return foodVideos as InfluencerFoodType[];
    } catch (error) {
      throw new Error("Failed to get food videos");
    }
  };

  updateFood = async (id: string, food: Partial<FoodType>) => {
    try {
      const updatedFood = await FoodModel.findByIdAndUpdate(id, food, {
        new: true,
      });
      if (!updatedFood) {
        throw new Error("Food not found");
      }
      return updatedFood as FoodType;
    } catch (error) {
      throw new Error("Failed to update food");
    }
  };

  deleteFood = async (id: string) => {
    try {
      await FoodModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error("Failed to delete food");
    }
  };
}

const foodService = new FoodService();
export { FoodService, foodService };
