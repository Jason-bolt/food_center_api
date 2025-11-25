import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  countries: { type: [String], required: true },
  region: { type: String, required: true },
  culturalStory: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  ingredients: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type FoodType = mongoose.InferSchemaType<typeof FoodSchema>;

export default mongoose.model("Food", FoodSchema);
