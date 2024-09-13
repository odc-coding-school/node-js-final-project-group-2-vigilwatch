const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const homeRouter = require('./routes/home');
const loginRouter = require('./routes/authRoutes');
const registerRoute = require('./routes/registerRoutes');

// Confiq the dotevn to load variables from the .env file
dotenv.config();
const app = express();

// static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Setting view engine to EJS 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the home router
app.use(homeRouter);

//use the login router
app.use(loginRouter);

//Use the sign-up router
app.use(registerRoute);

// Below will be route to other pages

// Server listen on port
const port = process.env.PORT || 3000;//Loading port number from the .env file if defined else 3000 is use
//guys please let us use the .env file for storing sensitive variables.

app.listen(port, () => {
    console.log(`Server is running on: (http://localhost:${port})`);
});
