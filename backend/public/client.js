// public/client.js
const socket = io();
const form    = document.getElementById('chat-form');
const input   = document.getElementById('m');
const messages= document.getElementById('messages');
const logout  = document.getElementById('logout');

const chatSocket = io();           // cho chat người-đến-người
const botSocket  = io('/bot');     // cho chat với bot
// Lấy username từ localStorage, nếu không có quay về login
const user = localStorage.getItem('chatUser');
if (!user) {
  window.location.href = '/';
}

// Xử lý logout
logout.addEventListener('click', () => {
  localStorage.removeItem('chatUser');
  window.location.href = '/';
});

// Khi form gửi, emit kèm user
form.addEventListener('submit', e => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { user, text: input.value });
    input.value = '';
  }
});

// Khi nhận tin nhắn mới, hiển thị
socket.on('chat message', msg => {
  const li = document.createElement('li');
  const time = new Date(msg.time).toLocaleTimeString();
  li.innerHTML = `<span class="msg-user">${msg.user}</span>
                  <span class="msg-text">${msg.text}</span>
                  <span class="msg-time">${time}</span>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// UI: khi bấm nút “Chat with Bot”
document.getElementById('bot-btn').addEventListener('click', () => {
  document.getElementById('chat-ui').style.display = 'none';
  document.getElementById('bot-ui').style.display  = 'block';
});

// Gửi tin nhắn đến bot
document.getElementById('bot-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('bot-input');
  botSocket.emit('bot message', input.value);
  addMessage('Bạn', input.value, 'bot-messages');
  input.value = '';
});

// Nhận reply từ bot
botSocket.on('bot reply', reply => {
  addMessage('Bot', reply, 'bot-messages');
});

// Hàm helper để hiển thị tin nhắn
function addMessage(sender, text, listId) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${sender}:</strong> ${text}`;
  document.getElementById(listId).appendChild(li);
}

