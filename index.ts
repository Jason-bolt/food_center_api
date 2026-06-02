import dotenv from "dotenv";
dotenv.config();

import express from "express";
import router from "./src/routes";
import { connectDB } from "./config/db";
import { connectRedis } from "./utils/services/redis";
import helmet from "helmet";
import cors from "cors";
import { serve } from "inngest/express";
import functions from "./inngest/functions";
import inngest from "./inngest";
import { rateLimit } from "express-rate-limit";
import logger from "./utils/logger";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) {
              cb(null, true);
            } else {
              cb(new Error(`CORS: origin '${origin}' not allowed`));
            }
          }
        : true,
  }),
);
app.use(helmet());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/v1", router);

const start = async () => {
  await connectDB();
  await connectRedis();
  app.listen(3000, () => {
    logger.info("Server is running on port 3000");
  });
};

start();
