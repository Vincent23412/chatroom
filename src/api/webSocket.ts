import http from "http";
import { parse } from "url";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from "../db.js";

dotenv.config();

interface CustomWebSocket extends WebSocket {
  name?: string;
  uuid?: string;
}

const connections = new Set<string>();

export default function setupWebSocket(server: http.Server): void {
  const wss1 = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const { pathname, query } = parse(request.url || "", true);
    const name = query?.username as string;

    if (name && connections.has(name)) {
      socket.destroy();
      return;
    }

    if (pathname === "/ws") {
      wss1.handleUpgrade(request, socket, head, (ws) => {
        const customWs = ws as CustomWebSocket;
        if (name) {
          customWs.name = name;
          connections.add(name);
        }
        wss1.emit("connection", customWs, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss1.on("connection", (ws: WebSocket) => {
    const customWs = ws as CustomWebSocket;
    const uuid = uuidv4();
    customWs.uuid = uuid;
    customWs.send(JSON.stringify({ topic: "uuid", context: "user", uuid }));

    pool.query(
      "SELECT author, timestamp, message_status, point, sticker, message FROM chat JOIN users ON chat.author = users.username",
      (err: Error | null, results: any) => {
        if (err) {
          customWs.send(
            JSON.stringify({
              status: "error",
              message: "Failed to retrieve messages from the database",
            })
          );
        } else {
          const messages = results.rows || [];
          customWs.send(
            JSON.stringify({
              status: "success",
              context: "chatHistory",
              messages,
            })
          );
        }
      }
    );

    customWs.on("message", (messageData: Buffer) => {
      const parsedMessage = JSON.parse(messageData.toString());
      const { token, message: word, username, sticker } = parsedMessage;
      const msg = {
        topic: "msg",
        context: "message",
        uuid,
        username,
        word,
        sticker,
      };
      const author = username || "visitor";

      jwt.verify(token, process.env.SECRET_KEY || "", () => {});

      pool.query(
        "INSERT INTO chat (author, message) VALUES ($1, $2)",
        [author, word],
        (err: Error | null) => {
          if (err) {
            customWs.send(
              JSON.stringify({
                status: "error",
                message: "Failed to save message to database",
              })
            );
          } else {
            sendAllUsers(wss1, msg);
          }
        }
      );
    });

    customWs.on("close", () => {
      if (customWs.name) {
        connections.delete(customWs.name);
      }
    });
  });
}

function sendAllUsers(wss: WebSocketServer, msg: any): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}
