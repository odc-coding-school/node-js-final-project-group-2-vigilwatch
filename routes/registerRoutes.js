// This is our register routes// Sign-up - Get Route
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../model/db');

const router = express.Router();


router.get('/sign-up', (req, res) => {
    res.render('Signup');
})

module.exports = router;