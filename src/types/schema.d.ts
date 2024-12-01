/**
 * {email} field is an email when authenticated with google
 * and a username when authenticated with tiktok
 */
interface IUser {
  _id: string;
  email: string;
  name: string;
  // username: string
  picture: string;
  registeredWith: "google" | "form";
  password: string;
}

interface IVideo {
  _id: string;
  userID: string;
  ids: Array<IUploadRes>;
  title: string;
  posted: string;
  updated: string;
}
