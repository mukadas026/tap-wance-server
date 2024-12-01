import axios, { isAxiosError } from "axios";
import { Request, Response } from "express";
import { tikAxiosClient } from "../../utils/axios.util";
import { readFile, writeFile } from "fs/promises";
// import fetch from "node-fetch";
// const fetch = require("node-fetch");

const MIN_CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_CHUNK_SIZE = 64 * 1024 * 1024;

const getCreatorInfo = async (req: Request) => {
  const url = "https://open.tiktokapis.com/v2";
  const creatorInfo = await tikAxiosClient.post<{ data: ITiktokCreatorInfo }>(
    "/post/publish/creator_info/query/",
    {},
    {
      headers: {
        // Authorization: `Bearer ${req.session.tiktok?.tokens.access_token}`,
        Authorization: `Bearer ${req.session.connectedAccounts?.tiktok?.tokens.access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  return creatorInfo.data.data;
};

const fileSlices: Buffer[] = [];

const uploadChunk = async ({
  url,
  mimeType,
  fileSize,
  range,
  file,
}: {
  url: string;
  mimeType: string;
  fileSize: number;
  range: Array<number>;
  file: Buffer;
}) => {
  // const fileSlice = file.slice(range[0], range[1]);
  // const fileCopy = Uint8Array.prototype.slice.call(file);
  const copySlice = file.buffer.slice(range[0], range[1] + 1);
  fileSlices.push(Buffer.from(copySlice));
  // const copySlice = fileCopy.slice(range[0], range[1]);

  const headers = new Headers();
  // headers.append("Content-Length", copySlice.length.toString());
  headers.append("Content-Length", copySlice.byteLength.toString());
  headers.append("Content-Type", mimeType);
  headers.append("Content-Range", `bytes ${range[0]}-${range[1]}/${fileSize}`);

  console.log("uploading chunk", range, copySlice.byteLength, fileSize, mimeType);

  const res = await fetch(url, {
    method: "PUT",
    body: copySlice,
    headers,
  });

  console.log("status", res.status, res.statusText);
  // const json = await res.json();
  // console.log("json", json);
};

export const tikUpload = async (
  req: Request,
  details: IUploadRequestDetails,
  file: Express.Multer.File
): Promise<IUploadRes> => {
  const creatorInfo = await getCreatorInfo(req);
  console.log("creatorInfo", creatorInfo);

  const fileSize = file.size;
  const numOfChunks = Math.ceil(fileSize / MAX_CHUNK_SIZE);
  const chunkSize = fileSize / numOfChunks;
  try {
    const tikClient = await tikAxiosClient.post<ITikUploadResponse>(
      "/post/publish/video/init/",
      {
        post_info: {
          title: details.title,
          // privacy_level: creatorInfo.privacy_level_options?.[1],
          privacy_level: "SELF_ONLY",
          disable_duet: creatorInfo.duet_disabled,
          disable_comment: creatorInfo.comment_disabled,
          disable_stitch: creatorInfo.stitch_disabled,
          // video_cover_timestamp_ms: 1000,
        },
        // source_info: createReadStream("./videos/IMG_1646.MOV")
        source_info: {
          source: "FILE_UPLOAD",
          video_size: fileSize,
          chunk_size: chunkSize,
          total_chunk_count: numOfChunks,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${req.session.connectedAccounts?.tiktok?.tokens.access_token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    console.log("Bearer", req.session.connectedAccounts?.tiktok?.tokens.access_token);
    console.log("tikClient", tikClient.data);

    const uploads: Array<() => Promise<void>> = [];

    for (let i = 0; i < numOfChunks; i++) {
      let start = i;
      let end = i + 1;
      if (i === numOfChunks - 2) {
        const nextChunkSize = fileSize - (numOfChunks - 1) * chunkSize;
        // let nextChunkSize = (i + 1) * chunkSize;
        if (nextChunkSize < MIN_CHUNK_SIZE) {
          end = i + 2;
        }
      }
      const range = [start * chunkSize, end * chunkSize - 1];
      uploads.push(
        async () =>
          await uploadChunk({
            url: tikClient.data.data.upload_url,
            mimeType: file.mimetype,
            fileSize: fileSize,
            range,
            file: file.buffer,
          })
      );
    }

    for (let i = 0; i < uploads.length; i++) {
      await uploads[i]();
      console.log("done!!");
    }

    return { id: tikClient.data.data.publish_id.split(".")[1], account: "tiktok" };

    // const f = Buffer.concat(fileSlices);

    // try {
    //   await writeFile("test-chunk.mp4", f, {});
    // } catch (e) {
    //   console.log(e);
    // }

    // for await (const upload of uploads) {
    //   console.log("done!!!");
    // }
  } catch (e) {
    if (isAxiosError(e)) {
      console.log(e.response?.data);
    } else {
      console.log(e);
    }
    throw e;
  }
};
