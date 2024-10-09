const express = require('express');
const db = require('../model/db');
const multer = require('multer');
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to insert incident into the database with trending status and expiry
const insertIncident = (incident) => {
    const trendingExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const sql = `INSERT INTO incident_reports (id, incident_type, images, date, time, description, location, trending, trending_expiry, user_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`;
    db.run(sql, [incident.id, incident.incident_type, JSON.stringify(images), incident.date, incident.time, incident.description, incident.location, trendingExpiry.toISOString(), incident.user_id], (err) => {
        if (err) {
            console.error('Error inserting incident:', err);
        }
    });
};

router.get('/report-incident', (req, res) => {
    // Check if the user is verified
    if (!req.session.verified) {
        return res.redirect('/verification');
    }

    res.render('Report');
});

router.post('/report-incident', upload.array('images', 10), (req, res) => {
    // Ensure the user is verified
    if (!req.session.verified) {
        return res.redirect('/verification');
    }

    const { incidentType, otherIncident, date, time, description, location } = req.body;

    if (!incidentType || !date || !time || !description || !location) {
        return res.send('Please fill in all fields');
    }

    const userId = req.session.verified.userID;

    // Process images
    let images = req.files.map(file => file.buffer);

    // Prepare incident data
    const incident = {
        id: uuidv4(),
        incident_type: incidentType,
        other_incident: otherIncident,
        images: JSON.stringify(images), // Store images as JSON
        date: date,
        time: time,
        description: description,
        location: location,
        user_id: userId
    };

    // Insert the incident into the database and set it as trending
    insertIncident(incident);

    res.redirect('/');
});

module.exports = router;
