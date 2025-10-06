import { InfluencerType } from "../../../../config/db/models/InfluencerModel";
import { InfluencerFoodType } from "../../../../utils/types/InfluencerTypes";
import { InfluencerFoodVideoType } from "../../../../utils/types/InfluencerTypes";

export default interface IService {
  createInfluencer: (influencer: Partial<InfluencerType>) => Promise<InfluencerType>;
//   updateInfluencer: (id: string, influencer: Partial<InfluencerType>) => Promise<InfluencerType>;
//   deleteInfluencer: (id: string) => Promise<void>;
//   getInfluencers: () => Promise<InfluencerType[]>;
//   getInfluencer: (id: string) => Promise<InfluencerType>;
//   getInfluencerFoods: (id: string) => Promise<InfluencerFoodType[]>;
//   getInfluencerVideos: (id: string) => Promise<InfluencerFoodVideoType[]>;
}