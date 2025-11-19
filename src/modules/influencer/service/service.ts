import InfluencerModel, {
  InfluencerType,
} from "../../../../config/db/models/InfluencerModel";
import IService from "./Iservice";
// import InfluencerFoodModel from "../../../../config/db/models/InfluencerFoodModel";
import {
  // InfluencerFoodType,
  // InfluencerFoodVideoType,
  InsertInfluencerFoodType,
} from "../../../../utils/types/InfluencerTypes";
import inngest from "../../../../inngest";
import logger from "../../../../utils/logger";

class InfluencerService implements IService {
  createInfluencer = async (influencer: InsertInfluencerFoodType) => {
    try {
      const newInfluencer = new InfluencerModel(influencer);
      await newInfluencer.save();

      inngest.send({
        name: "update_influencer_food_youtube_details.event",
        data: {
          foodLinks: influencer.foodLinks,
          influencerName: influencer.name,
        },
      });
      logger.info(
        { newInfluencer, influencerId: newInfluencer._id },
        "[InfluencerService - createInfluencer]: Created new influencer successfully"
      );
      return newInfluencer as InfluencerType;
    } catch (error) {
      logger.error(
        { error, influencer },
        "[InfluencerService - createInfluencer]: Failed to create influencer"
      );
      throw new Error("Failed to create influencer");
    }
  };

  getInfluencers = async () => {
    try {
      const influencers = await InfluencerModel.find();
      logger.info(
        { influencersCount: influencers.length },
        "[InfluencerService - getInfluencers]: Successfully fetched all influencers"
      );
      return influencers as InfluencerType[];
    } catch (error) {
      logger.error(
        { error },
        "[InfluencerService - getInfluencers]: Failed to get influencers"
      );
      throw new Error("Failed to get influencers");
    }
  };

  getInfluencer = async (id: string) => {
    try {
      const influencer = await InfluencerModel.findById(id);
      if (!influencer) {
        logger.warn(
          { influencerId: id },
          "[InfluencerService - getInfluencer]: Influencer not found"
        );
      } else {
        logger.info(
          { influencerId: id },
          "[InfluencerService - getInfluencer]: Successfully fetched influencer"
        );
      }
      return influencer as InfluencerType;
    } catch (error) {
      logger.error(
        { error, influencerId: id },
        "[InfluencerService - getInfluencer]: Failed to get influencer"
      );
      throw new Error("Failed to get influencer");
    }
  };

  updateInfluencer = async (
    id: string,
    influencer: InsertInfluencerFoodType
  ) => {
    try {
      const updatedInfluencer = await InfluencerModel.findByIdAndUpdate(
        id,
        influencer,
        { new: true }
      );
      if (!updatedInfluencer) {
        logger.warn(
          { influencerId: id },
          "[InfluencerService - updateInfluencer]: Influencer not found"
        );
      } else {
        logger.info(
          { influencerId: id, updatedInfluencer },
          "[InfluencerService - updateInfluencer]: Successfully updated influencer"
        );
      }

      inngest.send({
        name: "update_influencer_food_youtube_details.event",
        data: {
          foodLinks: influencer.foodLinks,
          influencerName: influencer.name,
        },
      });
      return updatedInfluencer as InfluencerType;
    } catch (error) {
      logger.error(
        { error, influencerId: id, influencer },
        "[InfluencerService - updateInfluencer]: Failed to update influencer"
      );
      throw new Error("Failed to update influencer");
    }
  };

  deleteInfluencer = async (id: string) => {
    try {
      await InfluencerModel.findByIdAndDelete(id);
      logger.info(
        { influencerId: id },
        "[InfluencerService - deleteInfluencer]: Successfully deleted influencer"
      );
    } catch (error) {
      logger.error(
        { error, influencerId: id },
        "[InfluencerService - deleteInfluencer]: Failed to delete influencer"
      );
      throw new Error("Failed to delete influencer");
    }
  };

  //   getInfluencerFoods = async (id: string) => {
  //     const influencerFoods = await InfluencerFoodModel.find({ influencer: id });
  //     return influencerFoods as InfluencerFoodType[];
  //   };

  //   getInfluencerVideos = async (id: string) => {
  //     const influencerVideos = await InfluencerFoodModel.find({ influencer: id });
  //     return influencerVideos as InfluencerFoodVideoType[];
  //   };
}

const influencerService = new InfluencerService();
export { InfluencerService, influencerService };
