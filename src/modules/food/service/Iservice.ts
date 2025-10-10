import { FoodType } from "../../../../config/db/models/FoodModel";
import { InfluencerFoodType } from "../../../../config/db/models/InfluencerFoodModel";

export default interface IService {
  createFood: (food: Partial<FoodType>) => Promise<FoodType>;
  getFoods: (
    page: number,
    limit: number,
    search?: string,
    country?: string,
    region?: string
  ) => Promise<{
    foods: FoodType[];
    totalpages: number;
    totalItems: number;
    page: number;
  }>;
  getFoodsNonPaginated: () => Promise<FoodType[]>;
  getFood: (id: string) => Promise<FoodType>;
  getFoodInfluencers: (foodId: string) => Promise<InfluencerFoodType[]>;
  getFoodVideos: (foodId: string) => Promise<InfluencerFoodType[]>;
  updateFood: (id: string, food: Partial<FoodType>) => Promise<FoodType>;
  deleteFood: (id: string) => Promise<void>;
}
