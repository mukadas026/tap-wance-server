import { Request, Response } from "express";
// import { getGoogleAuthClient } from "../../../utils/google.util";
// import { addUser, findUser } from "../../../models/user.model";
// import { IGoogleSession } from "../../../types/session.types";
import { v4 as uuidV4 } from "uuid";
import { getGoogleAuthClient } from "../../utils/google.util";
import { google } from "googleapis";
import { IYoutube } from "../../types/session.types";
import crypto from "crypto";
// import { Session } from "express-session";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export const youtubeAccountController = async (req: Request, res: Response) => {
  // req.session.google = new IGoogleSession();
  req.session.connectedAccounts!.youtube = new IYoutube();
  const oAuthClient = await getGoogleAuthClient("youtube");
  const scopes = [
    // "https://www.googleapis.com/auth/userinfo.email",
    // "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];
  const state = crypto.randomUUID();
  // res.cookie("state", state, { httpOnly: true });

  req.session.connectedAccounts!.youtube.state = state;

  const authURL = oAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
  });
  // console.log(authURL)
  res.redirect(authURL);
};

export const youtubeAccountRedirectController = async (
  req: Request<any, any, any, { code?: string; error?: string; state?: string }>,
  res: Response,
) => {
  // @ts-ignore

  const state = req.session.connectedAccounts.youtube?.state;
  console.log("state", state);
  // console.log(state);
  const q = req.query;
  if (q.error) {
    console.log("q.error", q.error);
    res.redirect(`${CLIENT_URL}/connected-accounts/error`);
  } else if (q.state !== state) {
    console.log("q.state !== state", q.state, state);
    res.redirect(`${CLIENT_URL}/connected-accounts/error`);
  } else if (q.code) {
    const oAuthClient = await getGoogleAuthClient("youtube");
    console.log("q.code", q.code);

    const { tokens } = await oAuthClient.getToken(q.code);
    console.log("tokens", tokens);
    req.session.connectedAccounts!.youtube.tokens = tokens;
    // const verify = await oAuthClient.verifyIdToken({
    //   // idToken: `${tokens.id_token}`,
    //   idToken: `${tokens.access_token}`,
    // });
    // oAuthClient.
    oAuthClient.setCredentials(tokens);
    const yt = google.youtube("v3");
    const list = await yt.channels.list({
      // oauth_token: `${tokens.access_token}`,
      // access_token: `${tokens.access_token}`,
      part: ["snippet", "contentDetails", "statistics"],
      auth: oAuthClient,
      // forUsername: "GoogleDevelopers",
      mine: true,
    });

    // list.data.items[0];
    console.log("list", JSON.stringify(list.data, null, 2));
    if (!list.data.items) {
      res.redirect(`${CLIENT_URL}/connected-accounts/error`);
    } else {
      const current = req.session.connectedAccounts!.youtube;
      req.session.connectedAccounts!.youtube = {
        ...current,
        title: `${list.data.items![0].snippet?.title}`,
        description: `${list.data.items![0].snippet?.description}`,
        username: `${list.data.items![0].snippet?.customUrl}`,
        thumbnail: `${list.data.items![0].snippet?.thumbnails?.default?.url}`,
        subscribers: Number(`${list.data.items![0].statistics?.subscriberCount}`),
        videos: Number(`${list.data.items![0].statistics?.videoCount}`),
      };

      res.redirect(`${CLIENT_URL}/connected-accounts`);
    }
  }
};
