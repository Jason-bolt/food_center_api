import InfluencerModel, {
  InfluencerType,
} from "../../../../config/db/models/InfluencerModel";
import IService from "./Iservice";
import InfluencerFoodModel from "../../../../config/db/models/InfluencerFoodModel";
import {
  InfluencerFoodType,
  InfluencerFoodVideoType,
  InsertInfluencerFoodType,
} from "../../../../utils/types/InfluencerTypes";
import inngest from "../../../../inngest";

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
      return newInfluencer as InfluencerType;
    } catch (error) {
      throw new Error("Failed to create influencer");
    }
  };

  getInfluencers = async () => {
    try {
      const influencers = await InfluencerModel.find();
      return influencers as InfluencerType[];
    } catch (error) {
      throw new Error("Failed to get influencers");
    }
  };

  getInfluencer = async (id: string) => {
    try {
      const influencer = await InfluencerModel.findById(id);
      return influencer as InfluencerType;
    } catch (error) {
      throw new Error("Failed to get influencer");
    }
  };

  updateInfluencer = async (
    id: string,
    influencer: Partial<InfluencerType>
  ) => {
    try {
      const updatedInfluencer = await InfluencerModel.findByIdAndUpdate(
        id,
        influencer,
        { new: true }
      );
      return updatedInfluencer as InfluencerType;
    } catch (error) {
      throw new Error("Failed to update influencer");
    }
  };

  deleteInfluencer = async (id: string) => {
    try {
      await InfluencerModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error("Failed to delete influencer");
    }
  };

  //   getInfluencerFoods = async (id: string) => {
  //     const influencerFoods = await InfluencerFoodModel.find({ influencerId: id });
  //     return influencerFoods as InfluencerFoodType[];
  //   };

  //   getInfluencerVideos = async (id: string) => {
  //     const influencerVideos = await InfluencerFoodModel.find({ influencerId: id });
  //     return influencerVideos as InfluencerFoodVideoType[];
  //   };
}

const influencerService = new InfluencerService();
export { InfluencerService, influencerService };
