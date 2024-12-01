import { Router } from "express";
import { googleRouter } from "./google.auth.router";
import { tikRouter } from "./tiktok.auth.router";
import { authController } from "../../controllers/auth/auth.controller";
import { registerController } from "../../controllers/auth/form/register.controller";
import { loginController } from "../../controllers/auth/form/login.controller";

export const authRouter = Router();

authRouter.get("/", authController);
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.use("/google", googleRouter);
// authRouter.use("/tiktok", tikRouter)
