require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Kiểm tra API Key
if (!process.env.OPENAI_API_KEY) {
  console.error('Lỗi: Chưa có OPENAI_API_KEY');
  process.exit(1);
}

// Khởi tạo OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Serve file tĩnh
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// Route mặc định
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));
});

// Health Check
app.get('/health', (req, res) => res.send('OK'));

// Chat nhóm
io.on('connection', socket => {
  console.log('User kết nối:', socket.id);

  socket.on('chat message', ({ user, text }) => {
    io.emit('chat message', { user, text, time: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('User rời khỏi:', socket.id);
  });
});

// ChatBot namespace
const botNs = io.of('/chat/chatbot');

botNs.on('connection', socket => {
  console.log('User vào bot:', socket.id);

  socket.on('bot message', async msg => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Bạn là một trợ lý ảo thông minh.' },
          { role: 'user', content: msg }
        ]
      });
      socket.emit('bot reply', response.choices[0].message.content);
    } catch (err) {
      console.error('OpenAI lỗi:', err);
      socket.emit('bot reply', 'Xin lỗi, bot đang bận. Hãy thử lại sau.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Bot user rời:', socket.id);
  });
});

// Server chạy
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server chạy ở cổng ${PORT}`));
