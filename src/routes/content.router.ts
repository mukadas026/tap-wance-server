import { Router } from "express";
import { listVideosController } from "../controllers/content/content.controller";

export const contentRouter = Router();

contentRouter.get("/list", listVideosController);
