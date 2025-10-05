import IController from "./Icontroller";
import { Request, Response } from "express";
import cloudinary from "../../../../config/cloudinary";

class UploadController implements IController {
  uploadImage = async (req: Request, res: Response): Promise<void> => {
    const image = req.file;

    if (!image || !image.path) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    try {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
        folder: "food_center",
      });
      if (!result) {
        res.status(500).json({ message: "Failed to upload image" });
        return;
      }
      res.status(200).json({ image: result.secure_url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to upload image" });
      return;
    }
  };
}

const uploadController = new UploadController();
export default uploadController;
