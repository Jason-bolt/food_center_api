import mongoose from "mongoose";
import logger from "../../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info("[MongoDB]: Connected");
  } catch (error) {
    logger.error({ error }, "[MongoDB]: Connection failed — exiting");
    process.exit(1);
  }
};
