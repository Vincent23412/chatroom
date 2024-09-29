const WebSocket = require('ws'); 
// const uuid4 = require('uuid');
// const { createServer } = require('http'); 
const connections = new Set(); 
const wss1 = new WebSocket.Server({ noServer: true });

wss1.on('connection', function connection(ws) {
    connections.add(ws); 
    console.log("WebSocket connection established.");

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Server received: ${message}`);
    });

    ws.on('close', () => {
        console.log('connected close'); 
        connections.delete(ws); 
    })

});

module.exports = {
    wss1,
    connections
};