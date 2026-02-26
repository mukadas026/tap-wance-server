import { Request, Response } from "express";
import crypto from "crypto";
import { tikAxiosClient } from "../../utils/axios.util";
import { ITikSession, ITiktok } from "../../types/session.types";
import { findUser } from "../../models/user.model";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export const tiktokAccountController = async (req: Request, res: Response) => {
  // req.session.tiktok = new ITikSession();
  req.session.connectedAccounts!.tiktok = new ITiktok();
  const tikState = crypto.randomUUID();
  req.session.connectedAccounts!.tiktok.state = tikState;

  let authURL = `https://www.tiktok.com/v2/auth/authorize/`;

  const codeVerifier = crypto.randomUUID();

  req.session.connectedAccounts!.tiktok.codeVerifier = codeVerifier;

  let codeChallenge = "" + crypto.createHash("sha256").update(codeVerifier).digest("hex");

  console.log(codeChallenge);

  authURL += `?client_key=${process.env.TIKTOK_CLIENT_KEY}`;
  authURL += "&scope=user.info.basic,user.info.profile,user.info.stats,video.publish,video.list";
  authURL += "&response_type=code";
  authURL += `&redirect_uri=${CLIENT_URL}/api/v1/auth/tiktok/redirect`;
  authURL += `&state=${tikState}`;
  authURL += `&code_challenge=${codeChallenge}`;
  authURL += "&code_challenge_method=S256";

  console.log(authURL);

  res.redirect(authURL);
};

export const tiktokAccountRedirectController = async (
  req: Request<any, any, any, { code?: string; error?: string; state?: string }>,
  res: Response,
) => {
  const q = req.query;
  console.log(q);

  if (q.error) {
    res.redirect(`${CLIENT_URL}/connected-accounts/error`);
  } else if (q.state !== req.session.connectedAccounts?.tiktok?.state) {
    res.redirect(`${CLIENT_URL}/connected-accounts/error`);
  } else if (q.code) {
    try {
      const data: { [key: string]: string } = {
        client_key: `${process.env.TIKTOK_CLIENT_KEY}`,
        client_secret: `${process.env.TIKTOK_CLIENT_SECRET}`,
        code: `${q.code}`,
        grant_type: `authorization_code`,
        redirect_uri: `${CLIENT_URL}/api/v1/auth/tiktok/redirect`,
        code_verifier: `${req.session.connectedAccounts?.tiktok?.codeVerifier}`,
      };
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const r = await tikAxiosClient.post<ITikAccessToken>("/oauth/token/", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      console.log(r.data);
      req.session.connectedAccounts!.tiktok.tokens = r.data;
      const re = await tikAxiosClient.get<{
        data: {
          user: {
            avatar_url: string;
            username: string;
            display_name: string;
            video_count: number;
            follower_count: number;
            bio_description: string;
          };
        };
      }>("/user/info/?fields=avatar_url,username,display_name,bio_description,video_count,follower_count", {
        headers: { Authorization: `Bearer ${r.data.access_token}` },
      });
      console.log("re", re.data.data);
      const user = re.data.data.user;
      req.session.connectedAccounts!.tiktok.title = user.display_name;
      req.session.connectedAccounts!.tiktok.username = user.username;
      req.session.connectedAccounts!.tiktok.thumbnail = user.avatar_url;
      req.session.connectedAccounts!.tiktok.videos = user.video_count;
      req.session.connectedAccounts!.tiktok.subscribers = user.follower_count;
      req.session.connectedAccounts!.tiktok.description = user.bio_description;
      // console.log(first)
      console.log("req.session.connectedAccounts!.tiktok", req.session.connectedAccounts!.tiktok);
      res.redirect(`${CLIENT_URL}/connected-accounts`);
    } catch (err) {
      console.log(err);
      res.redirect(`${CLIENT_URL}/connected-accounts/error`);
    }
  }
};
