import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import FoodModel from "../config/db/models/FoodModel";

const FOODS_JSON = path.resolve(__dirname, "../../foods.json");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  const foods = JSON.parse(fs.readFileSync(FOODS_JSON, "utf-8"));

  // Clear existing foods
  const deleted = await FoodModel.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing food documents`);

  // Insert new foods
  const inserted = await FoodModel.insertMany(foods);
  console.log(`Seeded ${inserted.length} foods successfully`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
