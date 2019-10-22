// import necessary packages
const mongoose = require("mongoose"); // needed for interacting with databases
const fs = require("fs");
const {
    spawn
} = require("child_process");

class Database {


    init(url) {
        console.log("- Initializing database...")
        // make sure url is given
        if (url == null) {
            throw ("You have not specified a mongoose connection URL.")
        }

        // connect to database
        mongoose.set('useCreateIndex', true)
        return mongoose.connect(url, {
            useNewUrlParser: true
        }).then(function (result) {
            console.log("✓ Database Connection.")
        }).catch(function (err) {
            throw (`Error connecting to MongoDB database at ${url}`);
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
            console.log(data.toString());
        });



        // when the backup is finished, check to see whether it was successfull or not.
        backup.on("close", (code) => {
            zip.stdin.end();
            if (code == 0) {
                console.log("✓ Backup completed sucessfully.")

            } else {
                console.log(` Backup failed with code: ${code}`)
            }
        })
    }

    checkBackupLocation(location) {
        return new Promise((resolve, reject) => {
            // Check that the backup location exists
            try {
                if (!location) throw ("No backup location specified.")
                console.log(fs.existsSync(location));
                if (fs.existsSync(location)) {
                    //file exists
                    console.log("✓ Database backup location found.");
                    resolve()
                } else {
                    console.log(location);
                    throw ("Database backup location not found.")
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}



module.exports = Database;