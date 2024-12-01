import { listYoutubeVideos } from "@/middleware/content/youtube-content.middleware";
import { getVideos } from "@/models/video.model";
import { Request, Response } from "express";

export const listVideosController = async (req: Request, res: Response) => {
  // await listYoutubeVideos(req);
  // Object.entries(req.session.connectedAccounts || {}).forEach(([key, value]) => {
  // })

  const videos = await getVideos({ userID: req.session.user?._id || "" });

  console.log("videos", videos);
  console.log("req.session.user", req.session.user);
  res.status(200).send(videos);
};
