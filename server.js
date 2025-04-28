const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}});

//Cấu hình AI
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
// 1) Phục vụ tệp tĩnh từ backend/public
app.use(express.static(path.join(__dirname, 'backend', 'public')));  // :contentReference[oaicite:0]{index=0}

// 2) Khi truy cập gốc '/', trả về index.html trong backend/public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));  // :contentReference[oaicite:1]{index=1}
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Namespace hoặc room riêng cho chatbot
const botNs = io.of('/chat/chatbot');

botNs.on('connection', socket => {
  console.log('User connected to bot:', socket.id);

  // Khi nhận event từ client muốn chat với bot
  socket.on('bot message', async (msg) => {
    try {
      // Gọi OpenAI Chat Completion
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful chatbot." },
          { role: "user",   content: msg }
        ]
      });
      const botReply = response.data.choices[0].message.content;

      // Trả lời client chỉ cho phiên này
      socket.emit('bot reply', botReply);
    } catch (err) {
      console.error(err);
      socket.emit('bot reply', "Xin lỗi, hiện tại bot đang bận. Hãy thử lại sau.");
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from bot:', socket.id);
  });
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
