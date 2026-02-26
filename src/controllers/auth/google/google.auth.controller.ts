import { Request, Response } from "express";
import { getGoogleAuthClient } from "../../../utils/google.util";
import { addUser, findUser } from "../../../models/user.model";
import { IGoogleSession } from "../../../types/session.types";
import { v4 as uuidV4 } from "uuid";
// import { Session } from "express-session";
import crypto from "crypto";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export const googleAuthController = async (req: Request, res: Response) => {
  // req.session.google = new IGoogleSession();
  const oAuthClient = await getGoogleAuthClient("google");
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    // "https://www.googleapis.com/auth/youtube",
    // "https://www.googleapis.com/auth/youtube.readonly",
    // "https://www.googleapis.com/auth/youtube.upload",
  ];
  const state = crypto.randomUUID();
  // res.cookie("state", state, { httpOnly: true });

  req.session.state = state;

  const authURL = oAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
  });
  // console.log(authURL)
  res.redirect(authURL);
};

export const googleAuthRedirectController = async (
  req: Request<any, any, any, { code?: string; error?: string; state?: string }>,
  res: Response,
) => {
  // @ts-ignore

  const state = req.session?.state;
  // console.log(state);
  const q = req.query;
  if (q.error) {
    // console.log(q.error);
    res.redirect(`${CLIENT_URL}/auth/error`);

  } else if (q.state !== state) {
    res.redirect(`${CLIENT_URL}/auth/error`);
  } else if (q.code) {
    const oAuthClient = await getGoogleAuthClient("google");
    // console.log(q.code);

    const { tokens } = await oAuthClient.getToken(q.code);
    // console.log(tokens);
    // oAuthClient.
    req.session.tokens = tokens;
    const verify = await oAuthClient.verifyIdToken({
      idToken: `${tokens.id_token}`,
    });
    const payload = verify.getPayload();
    // console.log("verify", verify);
    // console.log("user", user);

    if (payload === undefined) {
      res.redirect(`${CLIENT_URL}/auth/error`);
    } else {
      const { email, name, picture } = payload;
      if (email === undefined || name === undefined || picture === undefined) {
        res.redirect(`${CLIENT_URL}/auth/error`);
      } else {
        const _id = uuidV4();
        const user: IUser = {
          _id,
          email: `${payload.email}`,
          name: `${payload.name}`,
          // username: `${payload.name}`,
          picture: `${payload.picture}`,
          registeredWith: "google",
          password: "",
        };
        // check if user exists
        const userExists = await findUser(user.email);
        if (!userExists) {
          await addUser(user);
          req.session.user = user;
        } else {
          req.session.user = userExists;
        }

        if (!req.session.connectedAccounts) {
          // @ts-ignore
          req.session.connectedAccounts = {};
        }
        res.redirect(`${CLIENT_URL}`);
      }
    }
  }
};
