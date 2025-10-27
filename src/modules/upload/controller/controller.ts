import IController from "./Icontroller";
import { Request, Response } from "express";
import cloudinary from "../../../../config/cloudinary";
import logger from "../../../../utils/logger";

class UploadController implements IController {
  uploadImage = async (req: Request, res: Response): Promise<void> => {
    const image = req.file;

    if (!image || !image.path) {
      logger.error(
        { image: image?.filename },
        "[UploadController - uploadImage]: No image file provided"
      );
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    try {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
        folder: "food_center",
      });
      if (!result) {
        logger.error(
          "[UploadController - uploadImage]: Failed to upload image - no result from Cloudinary"
        );
        res.status(500).json({ message: "Failed to upload image" });
        return;
      }
      logger.info(
        { imageUrl: result.secure_url, imageId: result.public_id },
        "[UploadController - uploadImage]: Successfully uploaded image to Cloudinary"
      );
      res.status(200).json({ image: result.secure_url });
    } catch (error) {
      logger.error(
        { error, image: image?.filename },
        "[UploadController - uploadImage]: Failed to upload image"
      );
      res.status(500).json({ message: "Failed to upload image" });
      return;
    }
  };
}

const uploadController = new UploadController();
export default uploadController;
