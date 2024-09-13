// Landing page route (routes/home.js)
const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('Index');
});

module.exports = router;
