"use strict";

console.log("\n");

// Load in environment variables
const dotenv = require("dotenv");
const path = require('path');
dotenv.config({
    path: path.join(__dirname, '../.env')
});

const express = require("express");
const app = express();

// load config file. This maps the environment variables to javascript objects.
const Config = require("./struct/Config");

// Automatic CORS-policy handling
const cors = require("cors");
app.use(cors());

// Logging
const morgan = require("morgan");
app.use(morgan("dev"));
// Handle POST requests
const bodyParser = require("body-parser");
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// load application routes
const routes = require("./routes");
app.use(routes);

const Scheduler = require("./struct/scheduler/Scheduler");
const scheduler = new Scheduler();

// setup google api
const GoogleAuth = require("./struct/googleauth/GoogleAuth");
const googleAuth = new GoogleAuth();

// setup mailer
const Mailer = require("./struct/mailer/Mailer");
const mailer = new Mailer();

const Database = require("./struct/Database");
const database = new Database();

// Connect to the database and start the application
(async () => {

    try {

        // get google api keys.
        await googleAuth.init();

        // Initialise the mailer
        await mailer.init();

        // initialize database
        await database.init(Config.db.url, Config.db);

        // Check that the backup location exists.
        await database.checkBackupLocation(Config.db.backupLocation);

        scheduler.start();


        // Database is required, so only start server if database connection can be established
        app.listen(Config.port, function () {
            console.log(`✓ Started server on port ${Config.port}`);
            console.log("\n");
        });

    } catch (error) {
        console.log(`✗ ${error}`)
        console.log(`✗ Aborting...`)
        process.exit();
    }
})();