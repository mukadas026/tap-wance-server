import { Request, Router } from "express";
import { Auth, google, GoogleApis } from "googleapis";
import { getGoogleAuthClient } from "../../utils/google.util";
import {
	googleAuthController,
	googleAuthRedirectController,
} from "../../controllers/auth/google/google.auth.controller";

export const googleRouter = Router();

googleRouter.get("/", googleAuthController);

googleRouter.get("/redirect", googleAuthRedirectController);
