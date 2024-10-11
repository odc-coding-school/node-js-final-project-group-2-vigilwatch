const express = require('express');
const db = require('../model/db');
const multer = require('multer');
const { v4: uuidv4 } = require("uuid");
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

global.phoneNumber = '';
global.ReporterName = '';

router.get('/report-incident', (req, res) => {
    // Check if the user is verified
    if (!req.session.verified) {
        return res.redirect('/verification');
    }
    global.phoneNumber = req.session.verified.phone;
    global.ReporterName = req.session.verified.full_name;

    res.render('Report');
});

// Function to insert incident into the database with trending status and expiry
const insertIncident = (incident) => {
    const trendingExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const sql = `INSERT INTO incident_reports (id, incident_type, images, date, time, description, location, trending, trending_expiry, user_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`;
    
    // Use incident.images instead of images
    db.run(sql, [incident.id, incident.incident_type, incident.images, incident.date, incident.time, incident.description, incident.location, trendingExpiry.toISOString(), incident.user_id], (err) => {
        if (err) {
            console.error('Error inserting incident:', err);
        }
    });
};

const insertPendingIncident = (incident) => {
    const sql = `INSERT INTO pending_incidents (id, incident_type, other_incident, images, date, time, description, location, user_id, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [incident.id, incident.incident_type, incident.other_incident, incident.images, incident.date, incident.time, incident.description, incident.location, incident.user_id, 'pending'], (err) => {
        if (err) {
            console.error('Error inserting pending incident:', err);
        }
    });
};

const notifyModerator = (incident) => {
    console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS);
console.log('Reporter Name from session:', ReporterName);


    // Configure the email transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your email password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'njaygbay@gmail.com', 
        subject: 'New Incident Report Pending Approval',
        text: `A new incident report has been submitted:\n\n
               Incident Type: ${incident.incident_type}\n
               Date: ${incident.date}\n
               Time: ${incident.time}\n
               Description: ${incident.description}\n
               Location: ${incident.location}\n
               Reporter Full Name: ${ReporterName}\n
               Reporter's phone: ${phoneNumber}\n
               Please log in to the moderator dashboard to approve or reject this incident.`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};



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
        user_id: userId,
        status: 'pending' // Mark as pending until approved by the moderator
    };

    // Insert the incident into a temporary table for moderation
    insertPendingIncident(incident);

    // Notify the moderator (via email or by updating their dashboard)
    notifyModerator(incident);

    res.redirect('/');
});

router.get('/moderator-dashboard', (req, res) => {
    // Fetch relevant data for the moderator dashboard, e.g., number of approved incidents
    const sql = `SELECT COUNT(*) as approvedCount FROM incident_reports`; // Example query
    db.get(sql, [], (err, row) => {
        if (err) {
            return res.status(500).send('Error fetching dashboard data');
        }
        
        const approvedCount = row.approvedCount;
        // Fetch other relevant data, like pending incidents count
        const pendingSql = `SELECT COUNT(*) as pendingCount FROM pending_incidents`;
        db.get(pendingSql, [], (err, row) => {
            if (err) {
                return res.status(500).send('Error fetching pending incidents count');
            }
            
            const pendingCount = row.pendingCount;

            // Render the dashboard with counts
            res.render('moderatorDashboard', { approvedCount, pendingCount });
        });
    });
});

// Route to render the approve incidents page with all pending incidents
router.get('/approve-incidents', (req, res) => {
    const sql = `
        SELECT pi.*, u.full_name, a.phone
        FROM pending_incidents pi
        JOIN users u ON pi.user_id = u.id
        JOIN auth a ON u.id = a.user_id
    `;

    db.all(sql, [], (err, incidents) => {
        if (err) {
            return res.status(500).send('Error fetching incidents');
        }
        res.render('approveIncident', { incidents });
    });
});


// Route to approve an incident
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

            // Redirect to moderator dashboard after approval
            res.redirect('/moderator-dashboard');
        });
    });
});



module.exports = router;
