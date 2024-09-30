const WebSocket = require('ws'); 
const { v4: uuidv4 } = require('uuid');  // 使用解構賦值的方式導入 uuidv4
const connections = new Set(); 
const wss1 = new WebSocket.Server({ noServer: true });

// 當 WebSocket 連接建立時
wss1.on('connection', (ws) => {
    // 新增連接
    connections.add(ws); 
    console.log("WebSocket connection established.");

    // 生成唯一的 UUID 並分配給該 WebSocket 連接
    const uuid = uuidv4(); 
    ws.uuid = uuid; 

    // 發送 UUID 給客戶端
    const user = {
        context: 'user', 
        uuid
    };
    ws.send(JSON.stringify(user)); 

    // 當接收到客戶端的訊息時
    ws.on('message', (message) => {
        message = message.toString();  // 將 Buffer 轉換為字串
        console.log(`Received: ${message}`);

        // 創建訊息物件
        const msg = {
            context: 'message', 
            uuid, 
            message
        };

        // 將訊息廣播給所有用戶
        sendAllUsers(msg);
    });

    // 當連接關閉時
    ws.on('close', () => {
        console.log('WebSocket connection closed.');
        connections.delete(ws);  // 從連接集合中移除
    });
});

// 將訊息發送給所有連接的用戶
function sendAllUsers(msg) {
    wss1.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}

module.exports = {
    wss1,
    connections
};
