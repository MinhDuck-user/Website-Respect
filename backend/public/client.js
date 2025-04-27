// public/client.js
const socket = io();
const form    = document.getElementById('chat-form');
const input   = document.getElementById('m');
const messages= document.getElementById('messages');
const logout  = document.getElementById('logout');

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
