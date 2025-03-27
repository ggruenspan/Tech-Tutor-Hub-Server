// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();

const localTimeMiddleware = require('./middleware/getLocalTime.js');

// MongoDB connection setup
require('./bin/mongo-connection.js')

// Express session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

// Passport initialization and session setup
app.use(passport.initialize())
app.use(passport.session())
require('./config/passportConfig.js');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(localTimeMiddleware);

// Dynamically load all routes
const routesPath = path.join(__dirname, 'routes');
function loadRoutes(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath); // Recursively load subdirectories
        } else if (file.endsWith('.js')) {
            const route = require(fullPath);
            app.use('/', route); // Adjust the base path if needed
        }
    });
}
loadRoutes(routesPath);

// Path to your SSL certificate and key
const options = {
    key: fs.readFileSync('./ssl/localhost-key.pem'),
    cert: fs.readFileSync('./ssl/localhost.pem')
  };

// Create HTTPS server
https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`Server is running on https://localhost:${process.env.PORT}`);
});