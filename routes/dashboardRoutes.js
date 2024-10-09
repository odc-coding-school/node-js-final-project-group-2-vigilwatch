const express = require('express');
const db = require('../model/db');

const router = express.Router();

// Serve static files from the 'public' directory
router.use(express.static('public'));

router.get('#', (req, res) => {
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

        // Fetch all incidents and include pseudo_name from the auth table
        const query = `
            SELECT incident_reports.*, auth.pseudo_name, auth.phone
            FROM incident_reports
            JOIN auth ON incident_reports.user_id = auth.user_id
            ORDER BY incident_reports.id DESC`;

        db.all(query, [], (err, allIncidents) => {
            if (err) {
                console.error('Error occurred while fetching incidents:', err);
                return res.status(500).send('Error fetching incidents');
            }
        
            // Log the result to debug
            console.log('Fetched incidents:', allIncidents);

            // Process each incident (add formatted time/date, images in base64)
            allIncidents.forEach(incident => {
                // Format time
                if (incident.time) {
                    const date = new Date(`1970-01-01T${incident.time}Z`); // Convert time to Date object
                    let hours = date.getUTCHours();
                    const minutes = date.getUTCMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    incident.formatted_time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                }

                // Format date
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

            // Render the dashboard and pass the incidents to the view
            res.render('Dashboard', {
                userProfile: imageSrc,
                allIncidents
            });
        });
    });
});

module.exports = router;
