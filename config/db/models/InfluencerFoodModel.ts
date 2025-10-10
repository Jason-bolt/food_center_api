import mongoose from "mongoose";

const InfluencerFoodSchema = new mongoose.Schema({
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Influencer",
    required: true,
  },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  videoUrl: { type: String, required: true },
  videoTitle: { type: String, required: true },
  videoThumbnailUrl: { type: String, required: true },
  videoPublishedAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type InfluencerFoodType = mongoose.InferSchemaType<
  typeof InfluencerFoodSchema
>;

export default mongoose.model("InfluencerFood", InfluencerFoodSchema);
