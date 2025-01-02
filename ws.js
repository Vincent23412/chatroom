const WebSocket = require('ws'); 
const { v4: uuidv4 } = require('uuid');  // 使用解構賦值的方式導入 uuidv4
const pool = require('./db'); 
const auth = require('./auth'); 
const url = require('url'); 
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv'); 
dotenv.config(); 

const connections = new Set(); 


function setupWebSocket(server) {

    // 創建 WebSocket 伺服器
    const wss1 = new WebSocket.Server({ noServer: true });

    // 當有升級請求時處理 WebSocket 連接
    server.on('upgrade', (request, socket, head) => {
        const { pathname, query} = url.parse(request.url, true);
        console.log('upgrade'); 
        // console.log(pathname, query.username); 
        let name = query.username; 
        if (connections.has(name))
        {
            console.log('repeat login'); 
            return;
        }     

        // 檢查路徑是否符合 WebSocket 的路徑
        if (pathname === '/ws') {
            wss1.handleUpgrade(request, socket, head, (ws) => {
                connections.add(query.username); 
                console.log("in /ws"); 
                console.log(name); 
                ws.name = query.username; 
                wss1.emit('connection', ws, request);
                
            });
        } else {
            // 如果路徑不符合，則拒絕升級
            socket.destroy();
        }
    });


    // 當 WebSocket 連接建立時
    wss1.on('connection', (ws, req) => {
        // 新增連接
        
        console.log("WebSocket connection established.");

        // 生成唯一的 UUID 並分配給該 WebSocket 連接
        const uuid = uuidv4(); 
        ws.uuid = uuid; 

        // 發送 UUID 給客戶端
        const user = {
            topic: 'uuid',
            context: 'user', 
            uuid
        };

        ws.send(JSON.stringify(user)); 

        pool.query('select author, timestamp, message_status, point, sticker, message from chat JOIN users on chat.author = users.username', (err, results) => {
            if (err) {
                console.error('Error executing query:', err.stack); // 處理資料庫錯誤
                ws.send(JSON.stringify({
                    status: 'error',
                    message: 'Failed to retrieve messages from the database'
                }));
            } else {
                // 查詢成功，將結果發送給所有已連接的用戶
                const messages = results.rows; // 假設結果存儲在 rows 中
                const messageData = {
                    status: 'success',
                    context: 'chatHistory',
                    messages
                };
        
                // 廣播給所有已連接的 WebSocket 用戶
                ws.send(JSON.stringify(messageData));
            }
        });
        

        // 當接收到客戶端的訊息時
        ws.on('message', (message) => {
            // 將 Buffer 轉換為字串
            const parsedMessage = JSON.parse(message.toString());
            
            // 從解析後的物件中解構提取 token 和 message 字段
            const { token, message: word, username, sticker} = parsedMessage;
    
            console.log('Received message:', word);
            console.log('Token:', token);
            console.log('username', username); 
            console.log('sticker', sticker);

        
            // 創建訊息物件
            const msg = {
                topic: 'msg',
                context: 'message', 
                uuid,
                username,  
                word, 
                sticker
            };



            // 根据主机名设置 author

            let author = ''; 

            if (username)
                author = username;     
            else
                author = 'visitor'; 

        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            console.log(`welcome to ${username}`);   
        })

        // 插入資料到資料庫
        pool.query('INSERT INTO chat (author, message) VALUES ($1, $2)', [author, word], (err, result) => {
            if (err) {
                console.error('Error executing query:', err.stack);  // 處理資料庫錯誤
                ws.send(JSON.stringify({
                    status: 'error',
                    message: 'Failed to save message to database'
                }));
            } else {
                console.log('Message inserted successfully');
                console.log(msg); 
                // 成功插入後廣播給所有用戶
                sendAllUsers(wss1, msg, uuid);
            }
        });
        });
    

        // 當連接關閉時
        ws.on('close', () => {
            console.log('WebSocket connection closed.');
            // console.log(ws.name); 
            connections.delete(ws.name);  // 從連接集合中移除
            console.log(connections);    

        });
})

}

// 將訊息發送給所有連接的用戶
function sendAllUsers(wss1, msg) {
    wss1.clients.forEach((client) => {
        // 只向開啟的 WebSocket 發送消息
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}

module.exports = setupWebSocket;

