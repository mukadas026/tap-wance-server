import { Router } from "express";
import { uploadController } from "../controllers/upload/upload.controller";
import multer from "multer";

export const uploadRouter = Router();

uploadRouter.post("/", multer().any(), uploadController);
