import { Router } from "express";
import uploadController from "./controller/controller";
import { upload } from "./middleware";
import authMiddleware from "../../middleware/auth";

const uploadRouter = Router();

// Expect form field name 'image' for single-file uploads
uploadRouter.post("/", authMiddleware, upload.single("image"), uploadController.uploadImage);

export default uploadRouter;
