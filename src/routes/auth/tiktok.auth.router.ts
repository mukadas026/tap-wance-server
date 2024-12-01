import { Router } from "express";
import { tikAuthController, tikAuthRedirectController } from "../../controllers/accounts/tiktok.accounts";

export const tikRouter = Router();

tikRouter.get("/", tikAuthController);
tikRouter.get("/redirect", tikAuthRedirectController);
