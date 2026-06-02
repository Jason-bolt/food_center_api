import mongoose from "mongoose";

const EditorialSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  region:         { type: String, required: true, trim: true },
  description:    { type: String, required: true, trim: true },
  imageUrl:       { type: String, default: null },
  featuredFoodIds:{ type: [mongoose.Schema.Types.ObjectId], ref: "Food", default: [] },
  // Monday 00:00 UTC of the week this editorial is active
  activeWeek:     { type: Date, required: true },
  createdAt:      { type: Date, default: Date.now },
});

// At most one editorial per week
EditorialSchema.index({ activeWeek: 1 }, { unique: true });

export type EditorialType = mongoose.InferSchemaType<typeof EditorialSchema>;
export default mongoose.model("Editorial", EditorialSchema);
