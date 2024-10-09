const express = require('express');
const db = require('../model/db');

const router = express.Router();

router.get('/notification', (req, res) => {
 if (!req.session.user) {
     return res.redirect('/');
 }

 db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, user) => {
     if (err) {
         console.error('Error occurred while fetching user data:', err);
         return res.send('Error occurred while fetching user data');
     }

     if (!user) {
         return res.send('User not found');
     }

     const base64Image = user.profile_picture ? user.profile_picture.toString('base64') : null;
     const imageSrc = base64Image ? `data:image/png;base64,${base64Image}` : '/images/profile-default.png';

     db.all(`
        SELECT n.*, ir.incident_type, ir.description, ir.location, ir.date, ir.time, ir.images, 
               u.name AS user_name, u.profile_picture,
               r.location AS recipient_location
        FROM notification n
        JOIN incident_reports ir ON n.notification LIKE '%' || ir.incident_type || '%'
        JOIN users u ON ir.user_id = u.id  
        JOIN users r ON n.user_id = r.id  
        WHERE r.id = ?  
        AND u.location = r.location
        AND u.id != r.id  
        ORDER BY n.date_sent DESC
      `, [user.id], (err, notifications) => {
          if (err) {
              console.error('Error fetching notifications:', err);
              return res.send('Error fetching notifications');
          }
          
          const unreadNotifications = notifications.filter(notification => notification.read === 0);
      

         res.render('Notification', {
             userProfile: imageSrc,
             notifications: notifications,
             unreadNotifications 
         });
     });
 });
});


  
  
  
  


module.exports = router;