// index.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const startWSServer = require('./wsServer');

const app = express();
const server = http.createServer(app);
startWSServer(server);

app.get('/', (req, res) => {
  res.send('WebSocket Server Running');
});
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});



