const express = require('express');
const morgan = require('morgan'); 
const WebSocket = require('ws'); 
const http = require('http'); 
// const { wss1, connections}  = require('./ws'); 
const setupWebSocket = require('./ws'); 
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


setupWebSocket(server);


server.listen(process.env.PORT , '0.0.0.0', () => {
    console.log("Server is running on port", process.env.PORT); 
});
