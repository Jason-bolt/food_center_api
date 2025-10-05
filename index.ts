import express from "express";
import router from "./src/routes";
import { connectDB } from "./config/db";
import helmet from "helmet";
import cors from "cors";

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});