import { Router } from "express";
import uploadController from "./controller/controller";
import { upload } from "./middleware";

const uploadRouter = Router();

// Expect form field name 'image' for single-file uploads
uploadRouter.post("/", upload.single("imageUrl"), uploadController.uploadImage);

export default uploadRouter;
