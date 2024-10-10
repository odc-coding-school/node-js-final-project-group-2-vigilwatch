const express = require('express');
const router = express.Router();
const db = require('../model/db');

// Route to render the approve incident page
router.get('/approve-incident/:id', (req, res) => {
    const incidentId = req.params.id;

    // Fetch the incident from the pending_incidents table
    const sql = `SELECT * FROM pending_incidents WHERE id = ?`;
    db.get(sql, [incidentId], (err, incident) => {
        if (err || !incident) {
            return res.status(500).send('Incident not found');
        }
        res.render('approveIncident', { incident }); // Render the EJS page with incident data
    });
});

// Route to approve the incident
router.post('/approve-incident/:id', (req, res) => {
    const incidentId = req.params.id;

    // Fetch the incident from the pending_incidents table
    const sql = `SELECT * FROM pending_incidents WHERE id = ?`;
    db.get(sql, [incidentId], (err, incident) => {
        if (err || !incident) {
            return res.status(500).send('Incident not found');
        }

        // Insert into the incident_reports table
        insertIncident(incident);

        // Remove from pending_incidents
        const deleteSql = `DELETE FROM pending_incidents WHERE id = ?`;
        db.run(deleteSql, [incidentId], (err) => {
            if (err) {
                return res.status(500).send('Error approving incident');
            }

            res.redirect('/moderator-dashboard'); // Redirect to moderator dashboard after approval
        });
    });
});

module.exports = router;
