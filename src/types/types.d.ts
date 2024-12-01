interface IGoogleClientSecret {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_secret: string;
  redirect_uris: Array<string>;
  javascript_origins: Array<string>;
}

interface ITikAccessToken {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface ITikUploadResponse {
  data: {
    publish_id: string;
    upload_url: string;
  };
}

interface ITiktokCreatorInfo {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
}

interface IUploadRequestDetails {
  title: string;
  description: string;
  tags: Array<string>;
}

type Platform = "tiktok" | "youtube";

interface IUploadRes {
  id: string;
  account: Platform;
}
