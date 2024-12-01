import { Request } from "express";
import { google } from "googleapis";

export const listYoutubeVideos = async (req: Request) => {
  const session = req.session.connectedAccounts?.youtube;

  const youtube = google.youtube("v3");

  const channels = await youtube.channels.list({
    mine: true,
    part: ["snippet", "contentDetails", "brandingSettings"],
    oauth_token: `${session?.tokens.access_token}`,
  });

  console.log("youtube channels", JSON.stringify(channels.data, null, 2));

  const channelVideos = await youtube.playlistItems.list({
    part: ["id", "snippet", "status", "contentDetails"],
    oauth_token: `${session?.tokens.access_token}`,
    playlistId: channels.data.items?.[0].contentDetails?.relatedPlaylists?.uploads,
    maxResults: 10,
  });

  console.log("channelVideos", JSON.stringify(channelVideos.data, null, 2));
};
