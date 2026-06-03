import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema(
  {
    currentStreak:         { type: Number, default: 0 },
    longestStreak:         { type: Number, default: 0 },
    lastActiveDate:        { type: String, default: null }, // YYYY-MM-DD UTC
    totalRecipesGenerated: { type: Number, default: 0 },
    totalRecipesSaved:     { type: Number, default: 0 },
    xp:                    { type: Number, default: 0 },
    completedWeeks:        { type: [String], default: [] }, // week keys where full-plan XP was awarded
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  plan:                 { type: String, enum: ["free", "pro"], default: "free" },
  credits:              { type: Number, default: 0 },
  stripeCustomerId:     { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  stats:                { type: StatsSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
});

export type UserType = mongoose.InferSchemaType<typeof UserSchema>;
export default mongoose.model("User", UserSchema);
