const express = require('express');
const morgan = require('morgan'); 
const WebSocket = require('ws'); 
const http = require('http'); 
const { wss1, connections}  = require('./ws'); 

const app = express(); 
const PORT = 8000; 

app.use(morgan('dev'));
app.use(express.static('public')); 

const server = http.createServer(app); 

app.get('/', (req, res, next) =>{
    res.status(200).send('index'); 
});

app.get('/health', (req, res, next)=>{
    res.status(200).send('health'); 
});

app.get('/close', (req, res) => {
    console.log('收到客户端的 /close 请求');
    res.status(200).send('服务器已处理关闭请求');
});

app.get('/closeAll', (req, res) => {
    connections.forEach((ws) => {
        ws.close(); 
    })
})

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = request.url;

    if (pathname === '/ws') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
            wss1.emit('connection', ws, request);
        });
    }
    else {
        socket.destroy();
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log("Server is running on port", PORT); 
});
