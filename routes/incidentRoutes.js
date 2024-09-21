// This is our incident routes page

// This is our incident routes page
const express = require('express');
const db = require('../model/db');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/report-incident', (req, res) => {
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

        const base64Image = user.profile_picture ? user.profile_picture.toString('base64'): null;
        const imageSrc = base64Image ? `data:image/png;base64,${base64Image}` : '/images/profile-default.png';

        res.render('Report', { userProfile: imageSrc });
    });
});


router.post('/report-incident', upload.array('images', 10), (req, res) => {
    let { incidentType, otherIncident, date, time, description, location } = req.body;

    console.log("Received Location from Form:", location);

    if (incidentType === 'other' && otherIncident) {
        incidentType = otherIncident;
    }

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

        console.log('Saved Address:', savedLocation);
        console.log('Current Address:', location);

        // if (location !== savedLocation) {
        //     return res.send('Your current location does not match your registered location.');
        // }

        let images = req.files.map(file => file.buffer);

        db.run('INSERT INTO incident_reports (incident_type, other_incident, images, date, time, description, location, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [incidentType, otherIncident, JSON.stringify(images), date, time, description, location, userId],
            (err) => {
                if (err) {
                    console.error('Error occurred while inserting incident report:', err);
                    return res.send('Error occurred while inserting incident report');
                }
                res.redirect('/dashboard');
            }
        );
    });
});

module.exports = router;
