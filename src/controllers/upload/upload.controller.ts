import { Request, Response } from "express";
import { tikUpload } from "../../middleware/upload/tiktok.middleware";
import { uploadYoutubeVideo } from "../../middleware/upload/youtube.middleware";
import { addVideo, updateVideo } from "@/models/video.model";
import { randomUUID } from "crypto";

export const uploadController = async (req: Request, res: Response) => {
  // await googleUpload(req)
  const body = req.body;
  const files = req.files;
  if (files) {
    if (Array.isArray(files)) {
      const file = files[0];
      console.log("body", body);
      console.log("files", files);

      const accounts = req.session.connectedAccounts;

      const uploads: Promise<IUploadRes>[] = [];

      Object.keys(accounts || {}).forEach((key) => {
        switch (key) {
          case "tiktok":
            uploads.push(tikUpload(req, body, file));
            break;
          case "youtube":
            uploads.push(uploadYoutubeVideo(req, body, file));
            break;
          default:
            break;
        }
      });

      if (Object.keys(accounts || {}).length > 0) {
        const _id = randomUUID();
        const video = await addVideo({
          _id,
          userID: req.session.user?._id!,
          title: body.title,
          // ids: ,
        });
        console.log("sending res");
        res.status(200).send(video);
        console.log("res sent, about to upload");
        const uploadRes = await Promise.all(uploads);

        await updateVideo({
          _id,
          ids: uploadRes,
        });
      }

      return;
    }
    return res.status(400);
  }
  res.status(400);
};
