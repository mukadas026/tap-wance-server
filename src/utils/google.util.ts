import { google } from "googleapis";
import { getFile } from "./getFile.util";

export const getGoogleAuthClient = async (redirect: "google" | "youtube") => {
  const clientSecret = await getFile("client_secret.json");
  const [googleAuthRedirect, youtubeAuthRedirect] = clientSecret.redirect_uris;
  return new google.auth.OAuth2({
    clientId: clientSecret.client_id,
    clientSecret: clientSecret.client_secret,
    redirectUri: redirect === "google" ? googleAuthRedirect : youtubeAuthRedirect,
  });
};
