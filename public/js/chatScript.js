var socket = io();

// Handle chat initiation when a user is selected
document.querySelectorAll('.user-item').forEach(userItem => {
  userItem.addEventListener('click', function () {
    const targetUserId = this.dataset.userId;
    console.log(`Starting chat with user: ${targetUserId}`); // Add this for debugging
    socket.emit("start_private_chat", targetUserId);
  });
});


// When the server confirms the private chat has started
socket.on("chat_started", ({ roomId, targetUserId }) => {
  console.log(`Private chat started with user: ${targetUserId}`);

  // Send chat messages within the private room
  document.getElementById("newMessageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = e.target.elements[0].value;
    socket.emit("chat_message", { roomId, msg });
    e.target.elements[0].value = "";
  });
});

// Receive messages in the private room
socket.on("chat_msg", (msg) => {
  appendMessage(msg, msg.userId === username); // Highlight own messages
});

function appendMessage(msg, isSender) {
  const messages = document.getElementById("messages");
  const messageElement = document.createElement('div');
  messageElement.classList.add(isSender ? 'sender' : 'receiver');
  messageElement.innerHTML = `
    <div class="message-header">
      <span class="username">${msg.userId}</span>
      <span class="time">${msg.time}</span>
    </div>
    <div class="message-text">${msg.text}</div>
  `;
  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;
}
