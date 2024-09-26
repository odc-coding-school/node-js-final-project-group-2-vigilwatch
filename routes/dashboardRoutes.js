const express = require('express');
const db = require('../model/db');

const router = express.Router();

// Serve static files from the 'public' directory
router.use(express.static('public'));

router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    // Fetch user details to get their location
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

        // Fetch all incidents for the user's location
        db.all(`SELECT incident_reports.*, users.profile_picture, users.name, auth.email, auth.phone
            FROM incident_reports
            JOIN users ON incident_reports.user_id = users.id
            JOIN auth ON users.id = auth.user_id
            WHERE incident_reports.location = ? -- Match incident location with user's location
            ORDER BY incident_reports.id DESC`, [user.location], (err, allIncidents) => {
            if (err) {
                console.error('Error occurred while fetching incidents:', err);
                return res.status(500).send('Error fetching incidents');
            }

            // Process each incident in "ALL"
            allIncidents.forEach(incident => {
                // Convert profile pictures to base64 format
                if (incident.profile_picture) {
                    incident.profile_picture = incident.profile_picture.toString('base64');
                }

                // Format the time and date
                if (incident.time) {
                    const date = new Date(`1970-01-01T${incident.time}Z`); // Convert time to Date object
                    let hours = date.getUTCHours();
                    const minutes = date.getUTCMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    incident.formatted_time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                }

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
                    incident.imageSrcs = imagesArray.map(imageBuffer => `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`);
                }
            });

            res.render('Dashboard', {
                userProfile: imageSrc,
                allIncidents, // Incidents matching the user's location
            });
        });
    });
});

module.exports = router;
