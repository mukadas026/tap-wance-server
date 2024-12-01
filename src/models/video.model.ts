import { hash } from "bcrypt";
import dayjs from "dayjs";
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema<IVideo>({
  _id: String,
  userID: String,
  ids: [
    {
      id: String,
      account: String,
    },
  ],
  title: String,
});

videoSchema.pre("save", async function (next) {
  this.posted = dayjs().toISOString();
  this.updated = dayjs().toISOString();
  next();
});

videoSchema.pre("updateOne", async function (next) {
  this;
  next();
});

const videoModel = mongoose.model("video", videoSchema);

export const addVideo = async (video: { _id: string; userID: string; title: string }) => {
  const vid = await videoModel.create(video);
  return vid;
};

export const updateVideo = async (video: { _id: string; ids: Array<IUploadRes> }) => {
  // const vid = await videoModel.findOne({_id: video._id});
  await videoModel.updateOne({ _id: video._id }, { ids: video.ids });
  // return vid;
};

export const getVideos = async ({ userID }: { userID: string }) => {
  const vids = await videoModel.find({ userID }).exec();
  return vids;
};
