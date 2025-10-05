import { Request, Response } from "express";

export default interface IController {
  uploadImage: (req: Request, res: Response) => void;
}