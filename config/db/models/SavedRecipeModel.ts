import mongoose from "mongoose";

const SavedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
  title: { type: String, required: true },
  region: { type: String, default: "" },
  markdown: { type: String, required: true },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export type SavedRecipeType = mongoose.InferSchemaType<typeof SavedRecipeSchema>;
export default mongoose.model("SavedRecipe", SavedRecipeSchema);
