const express = require('express');
const morgan = require('morgan'); 
const WebSocket = require('ws'); 
const http = require('http'); 
const setupWebSocket = require('./ws'); 
const cors = require('cors');
const { Pool } = require('pg'); 
const pool = require('./db'); 
const dotenv = require('dotenv');
dotenv.config(); 
const auth = require('./auth'); 
const {liveData} = require('./live'); 

const app = express(); 

app.use(morgan('dev'));
app.use(express.static('public')); 
app.use(cors());
app.use(express.json());  // 用來解析 JSON 請求

const server = http.createServer(app); 

app.get('/', (req, res, next) =>{
    res.status(200).send('index'); 
});

app.get('/health', (req, res, next) => {
    res.status(200).send('health'); 
});


app.get('/close', (req, res) => {
    res.status(200).send('close connection');
});

app.get('/closeAll', (req, res) => {
    connections.forEach((ws) => {
        console.log(ws); 
        ws.close(); 
    })
    res.status(200).send('close all connection');
})


app.post('/register', auth.register); 

app.post('/login', auth.login); 


app.get('/protect', auth.authenticateToken, (req, res) => {
    res.json({message: 'welcome'}); 
})

app.post('/userInfo', auth.findUserData); 


app.get('/getAllMessage', (req, res) => {
    sendAllMessage(pool, res)
})



setupWebSocket(server);

server.listen(process.env.PORT , '0.0.0.0', () => {
    console.log("Server is running on port", process.env.PORT); 
});




function sendAllMessage(pool, res)
{
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
            res.send(JSON.stringify(messageData));
        }
    });
}
