const express = require('express');
const db = require('../model/db');
const fs = require('fs'); // For reading profile picture files

const router = express.Router();

router.get('/dd', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  const location = req.session.user.location;
  const userId = req.session.user.id;

  // Fetch all users from the same location except the logged-in user
  const query = `SELECT id, name, profile_picture FROM users WHERE location = ? AND id != ?`;
  db.all(query, [location, userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert profile picture to base64 for each user
    const users = rows.map(user => {
      if (user.profile_picture) {
        try {
          const pictureBuffer = fs.readFileSync(user.profile_picture);
          user.profile_picture_base64 = pictureBuffer.toString('base64');
        } catch (error) {
          console.error('Error reading profile picture:', error);
          user.profile_picture_base64 = null;
        }
      } else {
        user.profile_picture_base64 = null;
      }
      return user;
    });

    // Render EJS page and pass the users with base64 profile pictures
    res.render('users_list', { users });
  });
});

module.exports = router;


module.exports = router;
