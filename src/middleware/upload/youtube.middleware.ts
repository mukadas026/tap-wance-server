import { Request } from "express";
import { ReadStream } from "fs";
import { google } from "googleapis";

export const uploadYoutubeVideo = async (
  req: Request,
  details: IUploadRequestDetails,
  file: Express.Multer.File
): Promise<IUploadRes> => {
  const session = req.session.connectedAccounts?.youtube;

  const youtube = google.youtube("v3");
  console.log("details", details);

  const video = await youtube.videos.insert({
    access_token: `${session?.tokens.access_token}`,
    oauth_token: `${session?.tokens.access_token}`,
    part: ["id", "snippet", "status"],

    requestBody: {
      snippet: {
        title: details.title,
        description: details.description,
        // tags: details.tags.split(","),
      },
    },

    media: {
      body: ReadStream.from(file.buffer),
    },
  });

  return { id: video.data.id || "", account: "youtube" };
};
