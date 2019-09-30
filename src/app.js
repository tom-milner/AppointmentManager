"use strict";

console.log("\n")

const express = require('express');
const app = express();

// Load in environment variables
const dotenv = require("dotenv");
dotenv.config();

// load config file. This maps the environment variables to javascript objects.
const Config = require("./config/Config")


// Automatic CORS-policy handling
const cors = require("cors");
app.use(cors());

// Logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Handle POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// load application routes
const routes = require("./routes");
app.use(routes);

// start cron jobs
const Scheduler = require("./config/scheduler/Scheduler");
Scheduler.start();


// Connect to the database and start the application
(async () => {
    const database = require("./config/Database")
    console.log("- Connecting to database...");
    if (await database.initialize(Config.db.url)) {
        // Database is required, so only start server if database connection can be established
        app.listen(Config.port, function () {
            console.log(`- Started server on port ${Config.port}`);
            console.log("\n")

        });
    }
})();