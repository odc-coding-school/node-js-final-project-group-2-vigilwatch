const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const homeRouter = require('./routes/home');// Importting the home route

// Confiq the dotevn to load variables from the .env file
dotenv.config();
const app = express();

// static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Setting view engine to EJS 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the home router
app.use('/', homeRouter);

// Below will be route to other pages

// Server listen on port
const port = process.env.PORT || 3000;//Loading port number from the .env file if defined else 3000 is use

app.listen(port, () => {
    console.log(`Server is running on port: (http://localhost:${port})`);
});
