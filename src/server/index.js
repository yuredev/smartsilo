const http = require('http');
const io = require('socket.io')(http);
const express = require('express');
const app = express();
const WEB_SOCKET_PORT = 3000;
const HTTP_PORT = 3333;


io.on('connection', socket => {
  console.log(`New connection with the id: ${socket.id}`);
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP Working at http://localhost:${HTTP_PORT}`);
});

io.listen(WEB_SOCKET_PORT);
console.log(`Websocket Working at: http://localhost:${WEB_SOCKET_PORT}`);

