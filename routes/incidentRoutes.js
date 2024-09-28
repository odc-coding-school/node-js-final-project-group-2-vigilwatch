const express = require('express');
const db = require('../model/db');
const multer = require('multer');
const { getSocket } = require('../socket'); // Import getSocket

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/report-incident', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], (err, user) => {
        if (err) {
            console.error('Error occurred while fetching user data:', err);
            return res.send('Error occurred while fetching user data');
        }

        if (!user) {
            return res.send('User not found');
        }

        const base64Image = user.profile_picture ? user.profile_picture.toString('base64') : null;
        const imageSrc = base64Image ? `data:image/png;base64,${base64Image}` : '/images/profile-default.png';

        res.render('Report', { userProfile: imageSrc });
    });
});

router.post('/report-incident', upload.array('images', 10), (req, res) => {
    let { incidentType, otherIncident, date, time, description, location } = req.body;
    const userId = req.session.user.id;

    db.get('SELECT location FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('Error fetching user location:', err);
            return res.send('Error fetching user location');
        }

        if (!row) {
            return res.send('User not found');
        }

        const savedLocation = row.location;
        let images = req.files.map(file => file.buffer);

        // Save incident report
       // Save incident report
db.run('INSERT INTO incident_reports (incident_type, other_incident, images, date, time, description, location, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [incidentType, otherIncident, JSON.stringify(images), date, time, description, location, userId],
    function (err) {
        if (err) {
            console.error('Error occurred while inserting incident report:', err);
            return res.send('Error occurred while inserting incident report');
        }

        // Notify all users in the same location
        db.all('SELECT * FROM users WHERE location = ?', [savedLocation], (err, users) => {
            if (err) {
                console.error('Error fetching users for notification:', err);
                return res.send('Error fetching users for notification');
            }

            console.log(`Notifying ${users.length} users in location: ${savedLocation}`);

            // Emit notification to all users
            const io = getSocket(); // Get the io instance
            users.forEach(user => {
                const notificationMessage = `A new incident has been reported in your area: ${incidentType}.`;
                db.run('INSERT INTO notification (notification, user_id) VALUES (?, ?)', [notificationMessage, user.id], (err) => {
                    if (err) {
                        console.error('Error inserting notification:', err);
                    }
                });

                // Emit the notification to the connected users
                io.emit('new_notification', {
                    user_name: user.name,
                    incident_type: incidentType,
                    description: description
                });
            });
        });

        res.redirect('/dashboard'); // Redirect after reporting
    });

    });
});

module.exports = router;
