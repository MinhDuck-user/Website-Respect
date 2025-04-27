const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const server = { Server };
const io = new Server(server);
// 1) Phục vụ tệp tĩnh từ backend/public
app.use(express.static(path.join(__dirname, 'backend', 'public')));  // :contentReference[oaicite:0]{index=0}

// 2) Khi truy cập gốc '/', trả về index.html trong backend/public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));  // :contentReference[oaicite:1]{index=1}
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Socket.IO để chat realtime
io.on('connection', socket => {
  console.log('Người dùng kết nối:', socket.id);

  // Khi nhận chat message từ client, broadcast lại
  socket.on('chat message', ({ user, text }) => {
    io.emit('chat message', { user, text, time: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('Người dùng ngắt kết nối:', socket.id);
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);  // :contentReference[oaicite:2]{index=2}
});
