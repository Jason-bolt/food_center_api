import express from "express";
import router from "./src/routes";
import { connectDB } from "./config/db";
import helmet from "helmet";
import cors from "cors";
import { serve } from "inngest/express";
import functions from "./inngest/functions";
import inngest from "./inngest";
import dotenv from "dotenv";

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
