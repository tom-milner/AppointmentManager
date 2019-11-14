"use strict";

const isProd = process.env.NODE_ENV == "production";

// Setup PM2 monitoring (only on prod server)
if (isProd) {
    const io = require("@pm2/io");
    io.init({
        metrics: {
            network: {
                ports: true
            }
        }
    });
}

// Import external libraries
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const app = express();
const Sentry = require("@sentry/node");
const cors = require("cors");
const bodyParser = require("body-parser");

// Load in custom environment variables
dotenv.config({
    path: path.join(__dirname, "../.env")
});

// load config file. This maps the environment variables to javascript objects.
const Config = require("./struct/Config");

// Connect to sentry error tracking.
if (isProd) {
    Sentry.init({
        dsn: "https://9bffd9e390ff4804b85b30eb5d8ab9b1@sentry.io/1803636"
    });
    app.use(Sentry.Handlers.requestHandler()); // This request handler must be the first middleware on the app
}
// Automatic CORS-policy handling
app.use(cors());

// Handle POST requests
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// load application routes
const routes = require("./routes");
app.use(routes);

// User sentry error handler.
if (isProd) app.use(Sentry.Handlers.errorHandler());

// Import internal libraries
const GoogleAuth = require("./struct/googleauth/GoogleAuth");
const Mailer = require("./struct/mailer/Mailer");
const Database = require("./struct/Database");
const Logger = require("./struct/Logger")(module, "AppointmentManagerAPI");
const Scheduler = require("./struct/scheduler/Scheduler");

const scheduler = new Scheduler();
const googleAuth = new GoogleAuth();
const mailer = new Mailer();
const database = new Database();

// Connect to the database and start the application
(async () => {
    try {
        // Setup google APIs.
        await googleAuth.init();

        // Initialise the mailer
        await mailer.init();

        // initialize database
        await database.init(Config.db.url, Config.db);

        // Check that the backup location exists.
        await database.checkBackupLocation(Config.db.backupLocation);

        // start all scheduled tasks.
        scheduler.start();

        // Database is required, so only start server if database connection can be established
        app.listen(Config.port, function() {
            Logger.info(`Started server on port ${Config.port}`);
        });
    } catch (error) {
        Logger.error("Startup error", error);
        process.exit();
    }
})();
