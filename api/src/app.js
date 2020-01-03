"use strict";

// This file is responsible for setting up the different modules used by the AP.
// It is the main file used to start the API.

// This is a flag used to determine whether or not the app is running in a production environment or not. THe NODE_ENV environment variable is set automatically by the server.
const isProd = process.env.NODE_ENV == "production";

// Setup PM2 monitoring server (only on prod server)
if (isProd) {
    const io = require("@pm2/io");
    // This monitores app metrics, so that I can check the server status remotely.
    io.init({
        metrics: {
            network: {
                ports: true
            }
        }
    });
}

// Import external libraries
const dotenv = require("dotenv"); // Required for loading custom environment variables.
const path = require("path"); // Used for creating/using file paths.
const express = require("express"); // The server framework used by the app.
const app = express(); // creating a global express instance to use within the app.
const Sentry = require("@sentry/node"); // Sentry error tracking/reporting.
const cors = require("cors"); //  Used for cross-origin routing.
const bodyParser = require("body-parser"); // Used for processing a http request body.

// Load in custom environment variables
dotenv.config({
    path: path.join(__dirname, "../.env")
});

// load config file. This maps the above environment variables to javascript objects.
const Config = require("./struct/Config");

// TODO: move dotenv import to Config file.

// ** SETUP APP MIDDLEWARE **
// This includes error tracking & monitoring, application routes, and global middleware.

// Connect to sentry error tracking.
if (isProd) {
    // This enables me to remotely check errors via the sentry dashboard.
    Sentry.init({
        dsn: Config.monitoring.sentryDSN
    });
    app.use(Sentry.Handlers.requestHandler()); // NOTE: This request handler must be the first middleware on the app
}
// TODO: lock down cors
// Automatic CORS-policy handling
// This allows any origin to access the api routes.
app.use(cors());

// Setup app to handle POST requests. (Read a http request body)
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json()); // Load the http request body using JSON.

// Load application routes
const routes = require("./routes");
app.use(routes);

// Attach sentry error handler.
if (isProd) app.use(Sentry.Handlers.errorHandler());

// Import internal packages.
const GoogleAuth = require("./struct/googleauth/GoogleAuth"); // Used for authenticating with Google's API.
const Mailer = require("./struct/mailer/Mailer"); // Used for creating and sending emails to users.
const Database = require("./struct/Database"); // Used for connecting to the database.
const Logger = require("./struct/Logger"); // Used for logging application errors or important info.
const Scheduler = require("./struct/scheduler/Scheduler"); // Used for running scheduled tasks.

// Instantiate packages.
const scheduler = new Scheduler();
const googleAuth = new GoogleAuth();
const mailer = new Mailer();
const database = new Database();

// Connect to the database and start the application
// This is done in an anonymous function so that the processes can be run asynchronously.
(async () => {
    try {
        // Setup google APIs.
        await googleAuth.init();

        // Initialise the mailer.
        await mailer.init(isProd);

        // Initialize database
        await database.init(Config.db.url, Config.db);

        // Check that the backup location exists.
        await database.checkBackupLocation(Config.db.backupLocation);

        // Start all scheduled tasks.
        scheduler.start();

        // Start the server.
        app.listen(Config.port, function () {
            Logger.info(`Started server on port ${Config.port}`);
        });
    } catch (error) {
        Logger.error("Startup error.", error);
        process.exit();
    }
})();