// This is our auth routes

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../model/db');

const router = express.Router();

//Login - Get Route
router.get('/sign-in', (req, res) => {
    res.render('Signin');
});

//Login - Post Route
router.post('/login', (req, res) => {
    const { phone, password } = req.body;

    db.get(`SELECT * FROM auth WHERE phone = ?`, [phone], (err, row) => {
        if (err) {
            console.error('Error occurred while checking auth data:', err);
            return res.send('Error occurred while checking auth data');
        }

        if (!row) {
            return res.send('User not found');
        }

        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error('Error occurred while comparing passwords:', err);
                return res.send('Error occurred while comparing passwords');
            }

            if (!result) {
                return res.send('Incorrect password');
            }

            req.session.user = {
                id: row.user_id,
                email: row.email
            };
            res.redirect('/dashboard');
        });
    });
});


module.exports = router;
