const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require('../model/db'); // Database connection setup

const router = express.Router();

/* Chat route */
router.get("/chat", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;

  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      console.error('Error occurred while fetching user data:', err);
      return res.send('Error occurred while fetching user data');
    }

    if (!user) {
      return res.send('User not found');
    }

    const location = user.location;

    // Fetch all users from the same location except the logged-in user
    const query = `SELECT id, name, profile_picture FROM users WHERE location = ? AND id != ?`;
    db.all(query, [location, userId], (err, rows) => {
      if (err) {
        console.error('Error occurred while fetching users:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const users = rows.map(user => ({
        ...user,
        profile_picture_base64: user.profile_picture ? user.profile_picture.toString('base64') : null,
      }));

      res.render("chat", {
        users,
        total_neighbors: users.length,
        currentUser: user
      });
    });
  });
});


module.exports = (io) => {
  io.on("connection", (socket) => {
    const userSession = socket.request.session.user;
    
    // Log session details for debugging
    console.log('User session:', socket.request.session);

    if (!userSession || !userSession.name) {  // Ensure session has user details
      console.error('User session not found, disconnecting socket.');
      socket.disconnect();
      return;
    }
  
    const { location, id: userId, name } = userSession;

    // Handle sending private messages
    socket.on("chat_message", ({ roomId, msg }) => {
      const messageId = uuidv4();
      const time = new Date().toISOString();

      // Get recipientId from the roomId
      const [senderId, recipientId] = roomId.split('-');

      if (!senderId || !recipientId) {
        console.error('Invalid roomId format:', roomId);
        socket.emit('db_error', 'Invalid room ID format');
        return;
      }

      console.log(`Sender ID: ${senderId}, Recipient ID: ${recipientId}`);
    
      // Store the message in the database
      const insertQuery = `INSERT INTO messages (id, user_id, recipient_id, text) VALUES (?, ?, ?, ?)`;
      db.run(insertQuery, [messageId, senderId, recipientId, msg], (err) => {
        if (err) {
          console.error('Error storing message:', err.message);
          socket.emit('db_error', 'Failed to store message');
          return;
        }
        console.log('Message stored successfully:', { messageId, senderId, recipientId, text: msg });
        socket.emit('message_stored', { messageId, senderId, recipientId, text: msg }); // Notify the client
      });

      // Emit the message to both users in the private room
      io.to(roomId).emit("chat_msg", { id: messageId, userId: senderId, text: msg, time });
    });

    // Handle typing notifications
    socket.on("typing", ({ roomId }) => {
      io.to(roomId).emit("typing", name);  // Use `name` for typing notification
    });
  
    socket.on("stop_typing", ({ roomId }) => {
      io.to(roomId).emit("stop_typing", name);  // Use `name` for stop typing notification
    });
  
    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`${name} left the chat.`);
    });
  });

  return router;
};

