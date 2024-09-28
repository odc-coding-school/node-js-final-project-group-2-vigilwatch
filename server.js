// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./model/db');
const http = require('http'); // Import http module

//Variable to various routes
const registerRoutes = require('./routes/registerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const indexRoutes = require('./routes/home');
const logoutRoutes = require('./routes/logoutRoutes');
const analysisRoutes = require('./routes/incidentAnalysisRoutes');
const profileRoutes = require('./routes/profileRoutes');
const statisticsRoutes = require('./routes/StatisticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { initSocket } = require('./socket'); 


const app = express();
const server = http.createServer(app); // Create HTTP server
initSocket(server); // Initialize Socket.io

app.set('view engine', 'ejs'); //Set templating engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'thisisoursecretcode48425', resave: false, saveUninitialized: true }));

// Use the routes
app.use(registerRoutes);
app.use(dashboardRoutes);
app.use(authRoutes);
app.use(incidentRoutes);
app.use(indexRoutes);
app.use(logoutRoutes);
app.use(analysisRoutes);
app.use(profileRoutes);
app.use(statisticsRoutes);
app.use(notificationRoutes);

// Start the server
server.listen(3100, () => {
    console.log('Server is running on http://localhost:3100');
});
