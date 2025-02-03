import express from "express";
import morgan from "morgan";
import WebSocket from "ws";
import http from "http";
// import setupWebSocket from "./api/controllers/ws.js";
import cors from "cors";
import { Pool } from "pg";
import pool from "../db.js";
import dotenv from "dotenv";
import authRouter from "./api/routes/authRouter.js";
dotenv.config();

async function main() {
  const app = express();

  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cors());
  app.use(express.json()); // 用來解析 JSON 請求

  app.use("/auth", authRouter);

  const server = http.createServer(app);

  app.get("/", (req, res, next) => {
    res.status(200).send("index");
  });

  //   app.get("/health", (req, res, next) => {
  //     res.status(200).send("health");
  //   });

  //   app.get("/close", (req, res) => {
  //     res.status(200).send("close connection");
  //   });

  //   app.get("/closeAll", (req, res) => {
  //     connections.forEach((ws) => {
  //       console.log(ws);
  //       ws.close();
  //     });
  //     res.status(200).send("close all connection");
  //   });

  //   app.post("/register", auth.register);

  //   app.post("/login", auth.login);

  //   app.get("/protect", auth.authenticateToken, (req, res) => {
  //     res.json({ message: "welcome" });
  //   });

  //   app.post("/userInfo", auth.findUserData);

  //   app.get("/getAllUserInfo", auth.getAllUser);

  //   app.get("/getAllMessage", (req, res) => {
  //     sendAllMessage(pool, res);
  //   });

  //   app.get("/report", liveData);

  // setupWebSocket(server);

  server.listen(parseInt(process.env.PORT ?? "3000", 10), "0.0.0.0", () => {
    console.log("Server is running on port", process.env.PORT);
  });
}

main().catch((err) => {
  console.log(err);
});
