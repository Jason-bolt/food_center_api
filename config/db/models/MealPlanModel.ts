import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 }, // 0 = Mon … 6 = Sun
    savedRecipeId: { type: mongoose.Schema.Types.ObjectId, ref: "SavedRecipe", default: null },
    title: { type: String, required: true },
    region: { type: String, default: "" },
    imageUrl: { type: String, default: null },
    ingredients: { type: [String], default: [] },
  },
  { _id: false },
);

const MealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  weekStart: { type: Date, required: true }, // Always the Monday of the week (UTC midnight)
  slots: { type: [SlotSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

MealPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export type SlotType = mongoose.InferSchemaType<typeof SlotSchema>;
export type MealPlanType = mongoose.InferSchemaType<typeof MealPlanSchema>;
export default mongoose.model("MealPlan", MealPlanSchema);
