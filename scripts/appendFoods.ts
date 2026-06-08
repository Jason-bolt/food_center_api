import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import FoodModel from "../config/db/models/FoodModel";

const FOODS_JSON = path.resolve(__dirname, "../../foods_ghana.json");

async function append() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  const foods = JSON.parse(fs.readFileSync(FOODS_JSON, "utf-8"));

  const inserted = await FoodModel.insertMany(foods);
  console.log(`Appended ${inserted.length} Ghanaian foods successfully`);

  const total = await FoodModel.countDocuments();
  console.log(`Total foods in database: ${total}`);

  await mongoose.disconnect();
  console.log("Done.");
}

append().catch((err) => {
  console.error("Append failed:", err);
  process.exit(1);
});
