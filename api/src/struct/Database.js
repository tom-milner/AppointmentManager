// import necessary packages
const mongoose = require("mongoose"); // needed for interacting with databases
const fs = require("fs");
const path = require("path");
const {
    spawn,
    execSync
} = require("child_process");
const Logger = require("./Logger");

class Database {

    init(url, user) {
        Logger.info("Initializing database...")
        // make sure url is given
        if (url == null) {
            throw (new Error("You have not specified a mongoose connection URL."));
        }

        // connect to database
        mongoose.set('useCreateIndex', true)
        return mongoose.connect(url, {
            useNewUrlParser: true,
            "user": user.user,
            "pass": user.pass
        }).then(function (result) {
            Logger.info("Database Connected.")
        }).catch(function (err) {
            Logger.error("MongoDB connection error", err);
            throw (new Error(`Error connecting to MongoDB database at ${url}`));
        });

    }

    static backupDatabase(url, location, password) {

        // Backup the local database. 
        // This will need to be changed in the event that the database is hosted remotely.

        // Strart the backup in a new process.
        // mongodump -d devdb -o mongoBackups --collection vehicles


        const backup = spawn(`mongodump`, [`--uri=${url}`, `--archive`])
        const zip = spawn(`zip`, [`-P`, password, `${location}/appointmentManager.zip`, `-`]);

        backup.stdout.pipe(zip.stdin);

        zip.stdout.on("data", (data) => {
            Logger.info(data.toString());
        });



        // when the backup is finished, check to see whether it was successfull or not.
        backup.on("close", (code) => {
            zip.stdin.end();
            if (code == 0) {
                Logger.info("✓ Backup completed sucessfully.")

            } else {
                Logger.error(` Backup failed with code: ${code}`)
            }
        })
    }

    checkBackupLocation(location) {
        return new Promise((resolve, reject) => {
            // Check that the backup location exists
            try {
                if (!location) throw (new Error("No backup location specified."))

                // Check that the location specified is a folder
                if (path.extname(location)) {
                    // Path has a file extension - not a valid folder
                    throw (new Error("Specified location is not a directory"));
                }

                if (fs.existsSync(location)) {
                    //file exists
                    Logger.info("Database backup location found.");
                    resolve()
                } else {
                    Logger.warn("Database backup location not found. Creating directory...")
                    // Create the backup folder.
                    execSync(`mkdir ${location}`);
                    Logger.info(`Backup Directory created at ${location}`)
                }
            } catch (err) {
                Logger.error("Error checking backup location.", err)
                reject(err);
            }
        });
    }
}


module.exports = Database;