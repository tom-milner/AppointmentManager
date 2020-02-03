// import necessary packages
const mongoose = require("mongoose"); // needed for interacting with databases
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const Logger = require("./Logger");

// This file is for setting up and maintaining the database.

class Database {
  /**
   * This function attempts to setup the database connection.
   * @param {String} url - The URL of the database.
   * @param {{}} user - The database user credentials.
   */
  init(url, user) {
    Logger.info("Initializing database...");

    // Make sure a URL is provided.
    if (!url) throw new Error("You have not specified a mongoose connection URL.");

    // Connect to database
    return mongoose
      .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: user.user,
        pass: user.pass
      })
      .then(function(result) {
        Logger.info("Database Connected.");
      })
      .catch(function(err) {
        Logger.error("MongoDB connection error", err);
        throw new Error(`Error connecting to MongoDB database at ${url}`);
      });
  }

  /**
   *
   * @param {String} url - The url of the database.
   * @param {String} location - Where to store the backup.
   * @param {String} password - The password to encrypt the database backup with.
   */
  static backupDatabase(url, location, password) {
    // Backup the local database.

    //  Start the backup in a new process so that it doesn't block the current process.

    // Use the 'mongodump' tool to extract the database binary data.
    const backup = spawn(`mongodump`, [`--uri=${url}`, `--archive`]);

    // Store the backup in an encrypted zip file.
    const zip = spawn(`zip`, [`-P`, password, `${location}/appointmentManager.zip`, `-`]);

    // Pipe the output of the 'mongodump' command into the standard input of the zip command.
    backup.stdout.pipe(zip.stdin);

    // Log the output of the zip command.
    zip.stdout.on("data", data => {
      Logger.info(data.toString());
    });

    // When the backup is finished, check to see whether it was successful or not.
    backup.on("close", code => {
      // Close the standard input of the zip command.
      zip.stdin.end();

      // The status code for a successfull backup is 0
      if (code == 0) {
        Logger.info("✓ Backup completed sucessfully.");
      } else {
        Logger.error(` Backup failed with code: ${code}`);
      }
    });
  }

  /**
   * This function checks that the specified backup location exists and is accessible.
   * @param {String} location - The location to store the backup.
   * @returns {Promise} - Will either resolve successfully or return an error.
   */
  checkBackupLocation(location) {
    return new Promise((resolve, reject) => {
      // Check that the backup location exists.
      try {
        if (!location) throw new Error("No backup location specified.");

        // Check that the location specified is a folder, not a file.
        if (path.extname(location)) {
          // Path has a file extension - not a valid folder.
          throw new Error("Specified location is not a directory");
        }

        // Check the folder exists.
        if (fs.existsSync(location)) {
          // File exists
          Logger.info("Database backup location found.");
          resolve();
        } else {
          Logger.warn("Database backup location not found. Creating directory...");
          // Create the backup folder.
          execSync(`mkdir ${location}`);
          Logger.info(`Backup Directory created at ${location}`);
        }
      } catch (err) {
        Logger.error("Error checking backup location.", err);
        reject(err);
      }
    });
  }
}

module.exports = Database;
