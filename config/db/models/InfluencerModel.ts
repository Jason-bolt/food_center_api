import mongoose from "mongoose";

const InfluencerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: false },
  instagram: { type: String, required: false },
  youtube: { type: String, required: false },
  tiktok: { type: String, required: false },
  facebook: { type: String, required: false },
  twitter: { type: String, required: false },
  snapchat: { type: String, required: false },
  website: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type InfluencerType = mongoose.InferSchemaType<typeof InfluencerSchema>;

export default mongoose.model("Influencer", InfluencerSchema);
