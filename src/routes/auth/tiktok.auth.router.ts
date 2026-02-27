import { Router } from "express";
import { tiktokAccountController, tiktokAccountRedirectController } from "../../controllers/accounts/tiktok.accounts";

export const tikRouter = Router();

tikRouter.get("/", tiktokAccountController);
tikRouter.get("/redirect", tiktokAccountRedirectController);
