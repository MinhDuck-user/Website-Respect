// server.js
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Cho phép CORS
app.use(cors());

// Nếu có file tĩnh (CSS, JS…) đặt trong public/, phục vụ chúng ở root
app.use(express.static(path.join(__dirname, 'backend', 'public')));  // :contentReference[oaicite:0]{index=0}

// Tạo router cho diễn đàn
const forumRouter = express.Router();

// Route gốc (‘/’) hiển thị giao diện diễn đàn
forumRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend', 'public','index.html'));
});

// Socket.IO xử lý chat realtime
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

// Mount Socket.IO event handlers
io.on('connection', socket => {
  console.log('Người dùng kết nối', socket.id);
  socket.on('chat message', msg => io.emit('chat message', msg));
  socket.on('disconnect', () => console.log('Người dùng ngắt kết nối'));
});

// Mount forumRouter ngay tại đường dẫn root
app.use('/', forumRouter);  // :contentReference[oaicite:1]{index=1}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);  // :contentReference[oaicite:2]{index=2}
});
