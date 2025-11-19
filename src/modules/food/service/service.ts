import FoodModel, { FoodType } from "../../../../config/db/models/FoodModel";
import InfluencerFoodModel, {
  InfluencerFoodType,
} from "../../../../config/db/models/InfluencerFoodModel";
import IService from "./Iservice";
import logger from "../../../../utils/logger";

class FoodService implements IService {
  createFood = async (food: Partial<FoodType>) => {
    try {
      const newFood = new FoodModel(food);
      await newFood.save();
      logger.info(
        { newFood, foodId: newFood._id },
        "[FoodService - createFood]: Created new food successfully"
      );
      return newFood as FoodType;
    } catch (error) {
      logger.error(
        { error, food },
        "[FoodService - createFood]: Failed to create food"
      );
      throw new Error("Failed to create food");
    }
  };

  getFoods = async (
    page: number,
    limit: number,
    search?: string,
    country?: string,
    region?: string
  ) => {
    try {
      const skip = (page - 1) * limit;

      const whereClause: Record<string, { $regex: string; $options: string }> =
        {};
      if (search) {
        whereClause.name = { $regex: search, $options: "i" };
      }
      if (country) {
        whereClause.country = { $regex: country, $options: "i" };
      }
      if (region) {
        whereClause.region = { $regex: region, $options: "i" };
      }
      const foods = await FoodModel.find()
        .skip(skip)
        .limit(limit)
        .where(whereClause);
      const foodCount = await FoodModel.countDocuments();
      logger.info(
        { foodsCount: foods.length, totalItems: foodCount, page, limit },
        "[FoodService - getFoods]: Successfully fetched paginated foods"
      );
      return {
        foods,
        totalpages: Math.ceil(foodCount / limit),
        page,
        totalItems: foodCount,
      };
    } catch (error) {
      logger.error(
        { error, page, limit, search, country, region },
        "[FoodService - getFoods]: Failed to get foods"
      );
      throw new Error("Failed to get foods");
    }
  };

  getFoodsNonPaginated = async () => {
    try {
      const foods = await FoodModel.find();
      logger.info(
        { foodsCount: foods.length },
        "[FoodService - getFoodsNonPaginated]: Successfully fetched all foods"
      );
      return foods as FoodType[];
    } catch (error) {
      logger.error(
        { error },
        "[FoodService - getFoodsNonPaginated]: Failed to get foods"
      );
      throw new Error("Failed to get foods");
    }
  };

  getFood = async (id: string) => {
    try {
      const food = await FoodModel.findById(id);
      if (!food) {
        logger.warn({ foodId: id }, "[FoodService - getFood]: Food not found");
      } else {
        logger.info(
          { foodId: id },
          "[FoodService - getFood]: Successfully fetched food"
        );
      }
      return food as FoodType;
    } catch (error) {
      logger.error(
        { error, foodId: id },
        "[FoodService - getFood]: Failed to get food"
      );
      throw new Error("Failed to get food");
    }
  };

  getFoodInfluencers = async (foodId: string) => {
    try {
      const foodInfluencers = await InfluencerFoodModel.find({
        food: foodId,
      }).populate("influencer", "name");
      logger.info(
        { foodId, influencersCount: foodInfluencers.length },
        "[FoodService - getFoodInfluencers]: Successfully fetched food influencers"
      );
      return foodInfluencers as InfluencerFoodType[];
    } catch (error) {
      logger.error(
        { error, foodId },
        "[FoodService - getFoodInfluencers]: Failed to get food influencers"
      );
      throw new Error("Failed to get food influencers");
    }
  };

  getFoodVideos = async (foodId: string) => {
    try {
      const foodVideos = await InfluencerFoodModel.find({ food: foodId });
      logger.info(
        { foodId, videosCount: foodVideos.length },
        "[FoodService - getFoodVideos]: Successfully fetched food videos"
      );
      return foodVideos as InfluencerFoodType[];
    } catch (error) {
      logger.error(
        { error, foodId },
        "[FoodService - getFoodVideos]: Failed to get food videos"
      );
      throw new Error("Failed to get food videos");
    }
  };

  updateFood = async (id: string, food: Partial<FoodType>) => {
    try {
      const updatedFood = await FoodModel.findByIdAndUpdate(id, food, {
        new: true,
      });
      if (!updatedFood) {
        logger.warn(
          { foodId: id },
          "[FoodService - updateFood]: Food not found"
        );
        throw new Error("Food not found");
      }
      logger.info(
        { foodId: id, updatedFood },
        "[FoodService - updateFood]: Successfully updated food"
      );
      return updatedFood as FoodType;
    } catch (error) {
      logger.error(
        { error, foodId: id, food },
        "[FoodService - updateFood]: Failed to update food"
      );
      throw new Error("Failed to update food");
    }
  };

  deleteFood = async (id: string) => {
    try {
      await FoodModel.findByIdAndDelete(id);
      await InfluencerFoodModel.deleteMany({ food: id });
      logger.info(
        { foodId: id },
        "[FoodService - deleteFood]: Successfully deleted food and associated data"
      );
    } catch (error) {
      logger.error(
        { error, foodId: id },
        "[FoodService - deleteFood]: Failed to delete food"
      );
      throw new Error("Failed to delete food");
    }
  };
}

const foodService = new FoodService();
export { FoodService, foodService };
