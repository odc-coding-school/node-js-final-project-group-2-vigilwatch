const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./model/db');
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();

// Import various routes
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
const chatRoutes = require('./routes/chatRoutes');
const verificationRoutes = require('./routes/reportVerificationRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Initialize Socket.IO

const sessionMiddleware = session({
    secret: 'thisisoursecretcode48425',
    resave: false,
    saveUninitialized: true
});

// Share session with socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Set up middleware
app.use(sessionMiddleware);
app.set('view engine', 'ejs'); // Set templating engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));



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
app.use(chatRoutes(io));
app.use(verificationRoutes);

// Start the server
server.listen(3100, () => {
    console.log('Server is running on http://localhost:3100');
});
