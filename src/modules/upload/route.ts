import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import uploadController from "./controller/controller";
import { upload } from "./middleware";
import authMiddleware from "../../middleware/auth";

const uploadRouter = Router();

// Wrap multer so file-type and size errors return clean JSON 400/413 responses
// instead of falling through to the global 500 handler.
const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single("image")(req, res, (err: unknown) => {
    if (!err) { next(); return; }
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File too large. Maximum size is 5 MB." });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  });
};

uploadRouter.post("/", authMiddleware, uploadSingle, uploadController.uploadImage);

export default uploadRouter;
