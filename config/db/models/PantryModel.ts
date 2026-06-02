import mongoose from "mongoose";

const PantrySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  ingredients: { type: [String], default: [] },
  updatedAt:   { type: Date, default: Date.now },
});

export type PantryType = mongoose.InferSchemaType<typeof PantrySchema>;
export default mongoose.model("Pantry", PantrySchema);
