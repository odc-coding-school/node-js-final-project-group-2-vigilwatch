const express = require('express');
const db = require('../model/db');
const multer = require('multer');

const router = express.Router();

// Set up multer to store files in memory instead of saving them to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get profile page
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  // Fetch the current user's profile
  db.get(`
    SELECT users.*, auth.phone, auth.email
    FROM users
    JOIN auth ON auth.user_id = users.id
    WHERE users.id = ?
  `, [req.session.user.id], (err, user) => {
    if (err) {
      return res.status(500).send('Error fetching user data');
    }

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Convert binary data to base64 strings for the profile and cover pictures
    const profilePicture = user.profile_picture
      ? `data:image/jpeg;base64,${user.profile_picture.toString('base64')}`
      : '/images/profile-default.png';
    const coverPicture = user.cover_picture
      ? `data:image/jpeg;base64,${user.cover_picture.toString('base64')}`
      : '/images/cover-default.jpeg';

    // Fetch neighbors (users with the same address)
    db.all(`
      SELECT profile_picture, name
      FROM users
      WHERE location = ?
      AND id != ?
    `, [user.location, req.session.user.id], (err, neighbors) => {
      if (err) {
        return res.status(500).send('Error fetching neighbors');
      }

      db.all(`
        SELECT incident_reports.*, users.profile_picture, users.name, auth.email, auth.phone
        FROM incident_reports
        JOIN users ON incident_reports.user_id = users.id
        JOIN auth ON users.id = auth.user_id
        WHERE incident_reports.user_id = ?
        ORDER BY incident_reports.id DESC
      `, [req.session.user.id], (err, allIncidents) => {
        if (err) {
          console.error('Error occurred while fetching all incidents:', err);
          return res.status(500).send('Error fetching all incidents');
        }
      
        // Process each incident in "allIncidents"
        allIncidents.forEach(incident => {
          // Convert profile pictures to base64 format
          if (incident.profile_picture) {
            incident.profile_picture = incident.profile_picture.toString('base64');
          }
      
          // Format the time and date
          if (incident.time) {
            const date = new Date(`1970-01-01T${incident.time}Z`); // Correct string template for Date
            let hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            incident.formatted_time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
          }
      
          // Format the incident date
          if (incident.date) {
            const incidentDate = new Date(incident.date); // Convert to Date object
            incident.formatted_date = incidentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }
      
          // Parse and convert each image to base64 format
          if (incident.images) {
            const imagesArray = JSON.parse(incident.images);
            incident.imageSrcs = imagesArray.map(imageBuffer => 
              `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
            );
          }
        });
        

        // Render the profile page with user data and neighbors
        res.render('Profile', {
          user,
          userProfile: profilePicture,
          coverPicture,
          allIncidents,
          neighbors // pass the neighbors to the view
        });
      });
    });
  });
});

router.post('/addbio', (req, res) => {
 const { bio } = req.body;

 if (!bio || bio.length > 50) {
   return res.status(400).send('Bio is required and must be 50 characters or less.');
 }

 db.run('UPDATE users SET bio = ? WHERE id = ?', [bio, req.session.user.id], function (err) {
   if (err) {
     console.error('Error:', err);
     return res.status(500).send('Error adding bio');
   }

   res.redirect('/profile');
 });
});



// Update profile picture
router.post('/updateProfilePicture', upload.single('profilePicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const fileData = req.file.buffer;

  db.run('UPDATE users SET profile_picture = ? WHERE id = ?', [fileData, req.session.user.id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, error: 'Database update failed' });
    }

    // Send back the new image URL for previewing
    const newProfilePictureUrl = `data:image/jpeg;base64,${fileData.toString('base64')}`;
    res.json({ success: true, newProfilePictureUrl });
  });
});

// Update cover picture
router.post('/updateCoverPicture', upload.single('coverPicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const fileData = req.file.buffer;

  db.run('UPDATE users SET cover_picture = ? WHERE id = ?', [fileData, req.session.user.id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, error: 'Database update failed' });
    }

    // Send back the new image URL for previewing
    const newCoverPictureUrl = `data:image/jpeg;base64,${fileData.toString('base64')}`;
    res.json({ success: true, newCoverPictureUrl });
  });
});

module.exports = router;
