// server.js
require('dotenv').config();
const express = require('express');
const path    = require('path');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

// --- OpenAI Setup ---
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// --- Static files from backend/public ---
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// --- Health check endpoint ---
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- Chat namespace (user-to-user) ---
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('chat message', ({ user, text }) => {
    io.emit('chat message', { user, text, time: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Bot namespace ---
const botNs = io.of('/chat/bot');
botNs.on('connection', socket => {
  console.log('Bot-namespace user:', socket.id);

  socket.on('bot message', async msg => {
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user',   content: msg }
        ]
      });
      const reply = response.data.choices[0].message.content;
      socket.emit('bot reply', reply);
    } catch (err) {
      console.error('OpenAI error:', err);
      socket.emit('bot reply', 'Xin lỗi, bot đang bận. Vui lòng thử lại sau.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Bot-namespace user disconnected:', socket.id);
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
