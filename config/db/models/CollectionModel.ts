import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export type CollectionType = mongoose.InferSchemaType<typeof CollectionSchema>;
export default mongoose.model("Collection", CollectionSchema);
