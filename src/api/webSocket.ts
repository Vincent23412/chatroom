import http from 'http';
import { parse } from 'url';
import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
// 假設你的資料庫連線是用 pg 或其他，以下單純示範
import pool from '../db.js'; 

dotenv.config();

// 在 TypeScript 裡，如果我們要擴充 WebSocket 實例，使之能掛上自定屬性 (name, uuid)，
// 可以自行定義一個介面，或使用類似斷言 (as CustomWebSocket) 的作法。
interface CustomWebSocket extends WebSocket {
  name?: string;   // 加上可選屬性
  uuid?: string;
}

// 用來儲存「目前已連線且尚未關閉的使用者名稱」
const connections = new Set<string>();

/**
 * 建立 WebSocket Server 並掛載在傳進來的 http.Server 上
 */
export default function setupWebSocket(server: http.Server): void {
  // 創建 WebSocket 伺服器
  const wss1 = new WebSocketServer({ noServer: true });

  // 當有 upgrade 請求時，處理 WebSocket 連線
  server.on('upgrade', (request, socket, head) => {
    // 解析 URL，取得 pathname 與 query
    const { pathname, query } = parse(request.url || '', true);

    // 這裡假設前端連線時會帶 ?username=XXX
    const name = query?.username as string;

    // 簡易判斷：若已存在相同的 username，就不允許重複登入
    if (name && connections.has(name)) {
      console.log('repeat login');
      // 直接結束連線
      socket.destroy();
      return;
    }

    // 檢查路徑是否符合 WebSocket 路徑
    if (pathname === '/ws') {
      wss1.handleUpgrade(request, socket, head, (ws) => {
        // 轉換成我們自訂的介面，以便設定自訂屬性
        const customWs = ws as CustomWebSocket;
        if (name) {
          customWs.name = name;
          connections.add(name);
        }

        console.log('in /ws, user:', name);
        wss1.emit('connection', customWs, request);
      });
    } else {
      // 若路徑不符合，則拒絕升級
      socket.destroy();
    }
  });

  // 當 WebSocket 連線建立後
  wss1.on('connection', (ws: WebSocket, req) => {
    const customWs = ws as CustomWebSocket;

    console.log('WebSocket connection established.');

    // 生成唯一的 UUID 並分配給該連線
    const uuid = uuidv4();
    customWs.uuid = uuid;

    // 回傳給客戶端它的 UUID
    const userPayload = {
      topic: 'uuid',
      context: 'user',
      uuid,
    };
    customWs.send(JSON.stringify(userPayload));

    // 從資料庫抓取歷史訊息，然後發送給剛連進來的這個用戶
    pool.query(
      'SELECT author, timestamp, message_status, point, sticker, message \
       FROM chat JOIN users ON chat.author = users.username',
      (err: Error | null, results: any) => {
        if (err) {
          console.error('Error executing query:', err);
          customWs.send(
            JSON.stringify({
              status: 'error',
              message: 'Failed to retrieve messages from the database',
            })
          );
        } else {
          const messages = results.rows || [];
          const messageData = {
            status: 'success',
            context: 'chatHistory',
            messages,
          };
          customWs.send(JSON.stringify(messageData));
        }
      }
    );

    // 監聽客戶端發來的訊息
    customWs.on('message', (messageData: Buffer) => {
      // 將 Buffer 轉換成字串
      const parsedMessage = JSON.parse(messageData.toString());
      const { token, message: word, username, sticker } = parsedMessage;

      console.log('Received message:', word);
      console.log('Token:', token);
      console.log('username', username);
      console.log('sticker', sticker);

      // 組成要廣播的訊息
      const msg = {
        topic: 'msg',
        context: 'message',
        uuid,
        username,
        word,
        sticker,
      };

      // 確認 author
      const author = username || 'visitor';

      // 驗證 JWT（示範用）
      jwt.verify(token, process.env.SECRET_KEY || '', (err, user) => {
        if (err) {
          console.log('JWT verify error:', err);
        } else {
          console.log(`welcome to ${username}`);
        }
      });

      // 插入資料到資料庫
      pool.query(
        'INSERT INTO chat (author, message) VALUES ($1, $2)',
        [author, word],
        (err: Error | null) => {
          if (err) {
            console.error('Error executing query:', err);
            customWs.send(
              JSON.stringify({
                status: 'error',
                message: 'Failed to save message to database',
              })
            );
          } else {
            console.log('Message inserted successfully');
            // 廣播給所有用戶
            sendAllUsers(wss1, msg);
          }
        }
      );
    });

    // 當連線關閉時
    customWs.on('close', () => {
      console.log('WebSocket connection closed.');
      if (customWs.name) {
        connections.delete(customWs.name);
      }
      console.log('Current connections:', connections);
    });
  });
}

/**
 * 廣播訊息給所有已連接的用戶
 */
function sendAllUsers(wss: WebSocketServer, msg: any): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}
