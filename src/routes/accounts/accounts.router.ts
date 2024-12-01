import { Router } from "express";
import {
  youtubeAccountController,
  youtubeAccountRedirectController,
} from "../../controllers/accounts/youtube.accounts.controller";
import { accountsController } from "../../controllers/accounts/accounts.controller";
import { tiktokAccountController, tiktokAccountRedirectController } from "../../controllers/accounts/tiktok.accounts";

export const accountsRouter = Router();

// accounts
accountsRouter.get("/", accountsController);

// youtube
accountsRouter.get("/youtube", youtubeAccountController);
accountsRouter.get("/youtube/redirect", youtubeAccountRedirectController);

// tiktok
accountsRouter.get("/tiktok", tiktokAccountController);
// accountsRouter.get("/tiktok/redirect", tiktokAccountRedirectController);
