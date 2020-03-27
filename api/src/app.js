"use strict";

// This file is responsible for setting up the different modules used by the AP.
// It is the main file used to start the API.

// This is a flag used to determine whether or not the app is running in a production environment or not. THe NODE_ENV environment variable is set automatically by the server.
const isProd = process.env.NODE_ENV == "production";

// Import external libraries
const express = require("express"); // The server framework used by the app.
const app = express(); // creating a global express instance to use within the app.
const cors = require("cors"); //  Used for cross-origin routing.
const bodyParser = require("body-parser"); // Used for processing a http request body.

// load config file. This maps the environment variables to javascript objects.
const Config = require("./struct/Config");

// ** SETUP APP MIDDLEWARE **
// This includes error tracking & monitoring, application routes, and global middleware.

// Automatic CORS-policy handling
// This allows any origin to access the api routes.
app.use(cors()); // Currently any 'origin' can access the API as my client has not yet decided on a domain name.

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

// Setup global error handler.
app.use(function (err, req, res, next) {
  res.status(500).json({success: false, message: "Unexpected app error."})
});

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
    await database.init(Config.db.URL, {
      user: Config.db.USER,
      pass: Config.db.PASS
    });

    // Check that the backup location exists.
    await database.checkBackupLocation(Config.db.BACKUP_LOCATION);

    // Start all scheduled tasks.
    scheduler.start();

    // Start the server.
    app.listen(Config.PORT, function () {
      Logger.info(`Started server on port ${Config.PORT}`);
    });
  } catch (error) {
    Logger.error("Startup error.", error);
  }
})();
