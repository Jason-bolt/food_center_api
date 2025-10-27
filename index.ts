import express from "express";
import router from "./src/routes";
import { connectDB } from "./config/db";
import helmet from "helmet";
import cors from "cors";
import { serve } from "inngest/express";
import functions from "./inngest/functions";
import inngest from "./inngest";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

dotenv.config();
const app = express();

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
