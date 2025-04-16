const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files từ /forums
app.use('/forums', express.static(path.join(__dirname, 'backend', 'public')));

// Route chính chuyển hướng về giao diện
app.get('/forums', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/health', (req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/forums`);
});
