import InfluencerModel, {
  InfluencerType,
} from "../../../../config/db/models/InfluencerModel";
import IService from "./Iservice";
import InfluencerFoodModel from "../../../../config/db/models/InfluencerFoodModel";
import {
  InfluencerFoodType,
  InfluencerFoodVideoType,
} from "../../../../utils/types/InfluencerTypes";

class InfluencerService implements IService {
  createInfluencer = async (influencer: Partial<InfluencerType>) => {
    try {
      const newInfluencer = new InfluencerModel(influencer as InfluencerType);
      await newInfluencer.save();
      return newInfluencer as InfluencerType;
    } catch (error) {
      throw new Error("Failed to create influencer");
    }
  };

  //   updateInfluencer = async (id: string, influencer: Partial<InfluencerType>) => {
  //     const updatedInfluencer = await InfluencerModel.findByIdAndUpdate(id, influencer, { new: true });
  //     return updatedInfluencer as InfluencerType;
  //   };

  //   deleteInfluencer = async (id: string) => {
  //     await InfluencerModel.findByIdAndDelete(id);
  //   };

  //   getInfluencers = async () => {
  //     const influencers = await InfluencerModel.find();
  //     return influencers as InfluencerType[];
  //   };

  //   getInfluencer = async (id: string) => {
  //     const influencer = await InfluencerModel.findById(id);
  //     return influencer as InfluencerType;
  //   };

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
