import mongoose from "mongoose";
import { randomUUID } from "crypto";

export const API_PLANS = {
  free:    { label: "Free",    monthlyLimit: 50 },
  starter: { label: "Starter", monthlyLimit: 1_000 },
  growth:  { label: "Growth",  monthlyLimit: 10_000 },
} as const;

export type ApiPlan = keyof typeof API_PLANS;

const ApiKeySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  key:          { type: String, default: () => `fc_${randomUUID().replace(/-/g, "")}`, unique: true },
  plan:         { type: String, enum: Object.keys(API_PLANS), default: "free" },
  monthlyLimit: { type: Number, default: API_PLANS.free.monthlyLimit },
  usedThisMonth:{ type: Number, default: 0 },
  resetAt:      { type: Date,   default: () => firstOfNextMonth() },
  createdAt:    { type: Date,   default: Date.now },
});

/** Returns midnight UTC on the 1st of next month */
function firstOfNextMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export { firstOfNextMonth };
export type ApiKeyType = mongoose.InferSchemaType<typeof ApiKeySchema>;
export default mongoose.model("ApiKey", ApiKeySchema);
