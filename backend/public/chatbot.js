// public/chatbot.js
const botSocket = io('/chat/chatbot');  // Kết nối đúng namespace bot

document.getElementById('bot-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('bot-input');
  const message = input.value.trim();
  if (message) {
    addMessage('Bạn', message);
    botSocket.emit('bot message', message);
    input.value = '';
  }
});

// Khi nhận phản hồi từ bot
botSocket.on('bot reply', reply => {
  addMessage('Bot', reply);
});

// Hàm thêm tin nhắn vào giao diện
function addMessage(sender, text) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${sender}:</strong> ${text}`;
  document.getElementById('bot-messages').appendChild(li);
}
