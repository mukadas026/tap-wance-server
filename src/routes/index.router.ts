import { Router } from "express";
import { authRouter } from "./auth/auth.router";
import { uploadRouter } from "./upload.router";
import { accountsRouter } from "./accounts/accounts.router";
import { tiktokAccountRedirectController } from "../controllers/accounts/tiktok.accounts";
import { contentRouter } from "./content.router";

export const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/auth/tiktok/redirect", tiktokAccountRedirectController);

appRouter.use("/accounts", accountsRouter);

appRouter.use("/upload", uploadRouter);
appRouter.use("/content", contentRouter);
