const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../model/db');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('Signin');
});

router.post('/login', (req, res) => {
    const { phone, password } = req.body;

    // Fetch user from auth table based on phone number
    db.get(`SELECT * FROM auth WHERE phone = ?`, [phone], (err, row) => {
        if (err) {
            console.error('Error occurred while checking auth data:', err);
            return res.send('Error occurred while checking auth data');
        }

        if (!row) {
            return res.send('User not found');
        }

        // Compare provided password with stored hashed password
        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error('Error occurred while comparing passwords:', err);
                return res.send('Error occurred while comparing passwords');
            }

            if (!result) {
                return res.send('Incorrect password');
            }

            // Fetch user's additional information (like location) from users table
            db.get('SELECT * FROM users WHERE id = ?', [row.user_id], (err, user) => {
                if (err) {
                    console.error('Error occurred while fetching user data:', err);
                    return res.send('Error occurred while fetching user data');
                }

                if (!user) {
                    return res.send('User not found in users table');
                }

                // Store user details in session
                req.session.user = {
                    id: row.user_id,
                    email: row.email,
                    name: user.name,
                    location: user.location  // Assuming `location` exists in `users` table
                };
                
                // Redirect to the dashboard
                res.redirect('/dashboard');
            });
        });
    });
});

module.exports = router;
