import { Credentials } from "google-auth-library";

export class IGoogleSession {
  state: string;
  tokens: Credentials;
  user: IUser;
}

/**
 * {user.email} field is an email when authenticated with google
 * and a username when authenticated with tiktok
 */
export class ITikSession {
  state: string;
  tokens: ITikAccessToken;
  user: IUser;
  codeVerifier: string;
}

export class IYoutube {
  title: string;
  description: string;
  username: string;
  thumbnail: string;
  subscribers: number;
  videos: number;
  state: string;
  tokens: Credentials;
}

export class ITiktok {
  title: string;
  description: string;
  username: string;
  thumbnail: string;
  subscribers: number;
  videos: number;
  state: string;
  codeVerifier: string;
  tokens: ITikAccessToken;
}

interface IConnectedAccounts {
  youtube: IYoutube;
  tiktok: ITiktok;
  snapchat?: {};
  twitter?: {};
  instagram?: {};
  meta?: {};
}

declare module "express-session" {
  interface SessionData {
    user: IUser;
    state?: string;
    tokens?: Credentials;
    connectedAccounts: IConnectedAccounts;
    // google: IGoogleSession;
    // tiktok: ITikSession;
  }
}
