import express from "express";
import morgan from "morgan";
import WebSocket from "ws";
import http from "http";
import setupWebSocket from "./api/webSocket.js";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import authRouter from "./api/routes/authRouter.js";
import liveRouter from "./api/routes/liveRouter.js";
dotenv.config();

async function main() {
  const app = express();

  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cors());
  app.use(express.json()); // 用來解析 JSON 請求

  app.use("/auth", authRouter);
  app.use("/live", liveRouter);

  const server = http.createServer(app);

  app.get("/", (req, res, next) => {
    res.status(200).send("index");
  });

  app.get("/health", (req, res, next) => {
    res.status(200).send("health");
  });

  app.get("/close", (req, res) => {
    res.status(200).send("close connection");
  });

  setupWebSocket(server);

  server.listen(parseInt(process.env.PORT ?? "3000", 10), "0.0.0.0", () => {
    console.log("Server is running on port", process.env.PORT);
  });
}

main().catch((err) => {
  console.log(err);
});
