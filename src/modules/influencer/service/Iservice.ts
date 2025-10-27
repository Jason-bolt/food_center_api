import { InfluencerType } from "../../../../config/db/models/InfluencerModel";
import {
  // InfluencerFoodType,
  InsertInfluencerFoodType,
} from "../../../../utils/types/InfluencerTypes";
// import { InfluencerFoodVideoType } from "../../../../utils/types/InfluencerTypes";

export default interface IService {
  createInfluencer: (
    influencer: InsertInfluencerFoodType
  ) => Promise<InfluencerType>;
  getInfluencers: () => Promise<InfluencerType[]>;
  getInfluencer: (id: string) => Promise<InfluencerType>;
  updateInfluencer: (
    id: string,
    influencer: Partial<InfluencerType>
  ) => Promise<InfluencerType>;
  deleteInfluencer: (id: string) => Promise<void>;
  //   getInfluencerFoods: (id: string) => Promise<InfluencerFoodType[]>;
  //   getInfluencerVideos: (id: string) => Promise<InfluencerFoodVideoType[]>;
}
