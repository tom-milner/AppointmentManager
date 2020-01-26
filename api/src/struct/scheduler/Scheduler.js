const cron = require('node-cron');
const moment = require("moment");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const Database = require("../Database");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Mailer = require("../mailer/Mailer");
const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const Config = require("../Config");
const Logger = require("../Logger");

/*
    This file is for performing maintenance on the API and for running scheduled tasks.
*/


class Scheduler {

    constructor() {
        // The mailer is needed for some of the scheduled tasks.
        this.mailer = new Mailer();
    }

    /**
     * This function starts all the scheduled tasks using cron jobs.
     */
    start() {
        Logger.info("Starting Scheduler...")

        // Every Day = 0 0 * * *
        cron.schedule("0 0 * * *", () => {
            // Remove any expired guest accounts.
            removeExpiredGuests()
        });


        // Every Week = 0 0 * * 0
        cron.schedule("0 0 * * 0", () => {
            // Send the weekly appointments reminder email.
            sendWeeklyAppointmentsEmail(this.mailer);

            // Backup the database.
            Database.backupDatabase(Config.db.URL, Config.db.BACKUP_LOCATION, Config.db.BACKUP_PASSWORD);
        });

        // NOTE: I intentionally don't await the above functions, as it doesn't matter what order they run in.
    }
}


/**
 * This function sends all the users a reminder of their scheduled appointments for the week.
 * @param {{}} mailer - The mailer object to use to send emails.
 */
async function sendWeeklyAppointmentsEmail(mailer) {

    // Calculate the start and end of the week.
    let startOfWeek = moment().startOf("isoWeek");
    let endOfWeek = moment().endOf("isoWeek");

    try {
        // Get all the users from the database.
        let allUsers = await UserModel.find({});

        for (let user of allUsers) {
            // Get the appointments the user is involved in during the upcoming week.
            let weeksAppointments = await AppointmentModel.find({
                $or: [{
                        counsellorId: user._id
                    },
                    {
                        clients: user._id
                    }
                ],
                startTime: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            }).populate("clients");

            // Don't send an email if there're no appointments this week.
            if (weeksAppointments.length < 1) continue;

            // Send the email containing the users appointments.
            mailer.weeksAppointments(user, weeksAppointments).send();
        }
    } catch (error) {
        Logger.error("Error sending weekly appointments email.", error);
    }

}


/**
 * Remove any expired guest accounts from the database if they don't have any more appointments and have been inactive for more than a week.
 */
async function removeExpiredGuests() {
    try {
        let allGuests = await GuestModel.find({});
        let oneWeekAgo = moment().subtract(1, "week");

        let deletedCount = 0;

        // Loop through the guest accounts and check to see if they're expired or not.
        for (let guest of allGuests) {

            // Get all the appointments since last week that the guest has been or is going to be  involved in.
            let involvedAppointments = await AppointmentModel.find({
                clients: guest._id,
                startTime: {
                    $gt: oneWeekAgo
                }
            });

            // If the guest has not been involved in an appointment in the last week and has no appointments coming up, they can be considered to be deleted. 
            if (!involvedAppointments || involvedAppointments.length < 1) {
                // If the guest has been active for longer than one week.
                if (moment(guest.timeCreated).isBefore(oneWeekAgo)) {
                    // Delete the guest account
                    await GuestModel.findByIdAndDelete(guest._id);
                    deletedCount++;
                }
            }
        }
        let totalGuests = allGuests.length;
        Logger.info(`Deleted ${deletedCount}/${totalGuests} guest accounts. `)
    } catch (error) {
        Logger.error("Error removing expired guest accounts.", error);
    }
}

module.exports = Scheduler;