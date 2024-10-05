const express = require('express');
const morgan = require('morgan'); 
const WebSocket = require('ws'); 
const http = require('http'); 
const { wss1, connections}  = require('./ws'); 
const cors = require('cors');
const { Pool } = require('pg'); 
const pool = require('./db'); 
const dotenv = require('dotenv');
dotenv.config(); 
const auth = require('./auth'); 


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
    // console.log(process.env.DB_PORT);
    // console.log(process.env.DB_HOST);
    // console.log(process.env.DB_USER);
    // console.log(process.env.DB_PASSWORD);
    // console.log(process.env.DATABASE);

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




server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = request.url;

    if (pathname === '/ws') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
            console.log("WebSocket connection established.");
    
            // 在 WebSocket 連接建立時查詢資料庫
            pool.query('SELECT * FROM chat', (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                    // 使用 WebSocket 發送錯誤消息到客戶端
                    ws.send(JSON.stringify({
                        status: 'error',
                        message: 'Error fetching data from database'
                    }));
                } else {
                    // 使用 WebSocket 發送查詢結果到客戶端
                    ws.send(JSON.stringify({
                        status: 'success',
                        data: result.rows
                    }));
                }
            });
    
            // 處理 WebSocket 連接
            wss1.emit('connection', ws, request);
        });
    }
    
    else {
        socket.destroy();
    }
});

server.listen(process.env.PORT , '0.0.0.0', () => {
    console.log("Server is running on port", process.env.PORT); 
});
