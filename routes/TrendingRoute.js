const express = require('express');
const db = require('../model/db');

const router = express.Router();

router.get('/trending-news-2', (req, res) => {
    const currentDate = new Date().toISOString(); // Get current date and time

    // Query to fetch trending incidents that have not expired
    const sql = `SELECT * FROM incident_reports WHERE trending = TRUE AND trending_expiry > ?`;

    db.all(sql, [currentDate], (err, rows) => {
        if (err) {
            console.error('Error fetching trending incidents:', err);
            return res.send('Error fetching trending incidents');
        }

        rows.forEach(incident => {
            if (incident.images) {
                try {
                    // Parse the JSON string into an array of buffers
                    const imageBuffers = JSON.parse(incident.images);
        
                    // Ensure imageBuffers is an array
                    if (Array.isArray(imageBuffers)) {
                        // Convert each buffer to a base64 string
                        incident.images = imageBuffers.map(buffer => `data:image/jpeg;base64,${buffer.toString('base64')}`);
                    } else {
                        incident.images = []; // Set to empty array if not an array
                    }
                } catch (error) {
                    console.error('Error parsing incident images:', error);
                    incident.images = []; // Ensure it's an empty array if parsing fails
                }
            } else {
                incident.images = []; // If no images, set to an empty array
            }
        });
        console.log('Fetched incidents:', rows);


        // Render the EJS page with the incidents data
        res.render('Trending', { incidents: rows });
    });
});

module.exports = router;
