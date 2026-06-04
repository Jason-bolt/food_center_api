import mongoose from "mongoose";

const FeaturedSlotSchema = new mongoose.Schema({
  influencerId: { type: mongoose.Schema.Types.ObjectId, ref: "Influencer", required: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  position:     { type: String, enum: ["hero", "sidebar"], default: "hero" },
  price:        { type: Number, required: true }, // in USD
  note:         { type: String, default: "" },    // internal admin note
  createdAt:    { type: Date, default: Date.now },
});

export type FeaturedSlotType = mongoose.InferSchemaType<typeof FeaturedSlotSchema>;
export default mongoose.model("FeaturedSlot", FeaturedSlotSchema);
