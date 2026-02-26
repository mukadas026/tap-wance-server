/// <reference types="./types/types.d.ts" />
/// <reference types="./types/schema.d.ts" />

import express from "express";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import "dotenv/config";
import { appRouter } from "./routes/index.router";
import { getFile } from "./utils/getFile.util";
import session from "express-session";
import bodyParser from "body-parser";
import { createClient } from "redis"
import { RedisStore } from "connect-redis"

const PORT = process.env.PORT || 7000;
const MONGO_URL = process.env.MONGO_URL;
mongoose
  .connect(`${MONGO_URL}`, {
    dbName: "tap-wance",
  })
  .catch((err) => {
    console.log(err);
  });
mongoose.connection.on("error", () => {
  console.log("error");
});

const app = express();

// cors
const corsOptions: CorsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));
// cookie parser
// app.use(cookieParser())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const redisClient = createClient()
redisClient.connect().catch(err => console.log("redis error", err))

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "tap-wance-session:"
})
app.use(
  session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: `${process.env.JWT_SECRET || "justrandomwords"}`,
  }) as any
);

app.use(bodyParser.json());

// router
app.use("/api/v1", appRouter);

app.get("/", (req, res) => {
  res.status(200).json("hello world");
});

// getFile("client_secret.json").then(d => console.log(d))

app.listen(PORT, () => {
  console.log(`app is listening ${PORT}`);
});
