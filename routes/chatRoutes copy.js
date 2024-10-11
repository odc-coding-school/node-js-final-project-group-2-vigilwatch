const express = require("express");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const {
  userJoin,
  userLeave,
  getRoomUsers,
  checkUserNameExists,
} = require("../utils/users"); // Adjust the path as necessary

const router = express.Router();

/* routes */
router.get("/chat-home", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
}
   res.render("chatIndex.ejs")
});

router.get("/chat", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
}
   res.render("chat.ejs") 
  });


const typingUsers = new Map();
const messages = [];

// Export a function that takes io as an argument
module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("checkUsername", ({ username }) => {
      socket.emit("usernameCheckResult", checkUserNameExists(username));
    });

    socket.on("join_room", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room); // create a new room and join
      console.log("Server: New Connection");
      console.log(user);

      // Notify other users in the room
      socket.broadcast
        .to(user.room)
        .emit("system_msg", `${username} joined the chat`);

      // Send room info to all users
      io.to(user.room).emit("room_users", {
        room: user.room,
        users: getRoomUsers(room),
      });

      // Handle incoming chat messages
      socket.on("chat_message", (msg) => {
        const message = {
          id: uuidv4(),
          username: user.username,
          room: user.room,
          text: msg,
          time: moment().format("h:mm a"),
          likes: [],
        };
        messages.push(message);
        io.to(user.room).emit("chat_msg", message);
      });

      // Handle typing events
      socket.on("typing", ({ username, room }) => {
        if (!typingUsers.has(room)) {
          typingUsers.set(room, new Set());
        }
        typingUsers.get(room).add(username);
        io.to(room).emit("typing", Array.from(typingUsers.get(room)));
      });

      socket.on("stop_typing", ({ username, room }) => {
        if (typingUsers.has(room)) {
          typingUsers.get(room).delete(username);
          io.to(room).emit("stop_typing", Array.from(typingUsers.get(room)));
        }
      });

      socket.on("like_message", ({ messageId, username }) => {
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          if (!message.likes.includes(username)) {
            message.likes.push(username);
          } else {
            message.likes = message.likes.filter((user) => user !== username);
          }

          io.to(user.room).emit("update_likes", {
            messageId,
            likes: message.likes,
          });
        }
      });

      /* disconnect */
      socket.on("disconnect", () => {
        const user = userLeave(socket.id); // remove user from users list

        if (user) {
          io.to(user.room).emit("system_msg", `${username} left the chat`);
        }
      });
    });
  });

  return router; // Return the router
};
