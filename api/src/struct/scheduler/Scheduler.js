// Run maintenace.
const cron = require('node-cron');
const moment = require("moment");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const Database = require("../Database");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Mailer = require("../mailer/Mailer");
const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const Config = require("../Config");
const Logger = require("../Logger");


class Scheduler {


    constructor() {
        this.mailer = new Mailer();
    }


    start() {
        Logger.info("Starting Scheduler...")

        // Every Day
        cron.schedule("0 0 * * *", () => {
            // remove any expired guest accounts.
            removeExpiredGuests()
        });

        // Every Week
        // 0 0 * * 0
        cron.schedule("0 0 * * 0", () => {
            sendWeeklyAppointmentsEmail(this.mailer);
            Database.backupDatabase(Config.db.url, Config.db.backupLocation, Config.db.backupPassword);
        });

        // NOTE: I intentionally don't await the above functions, as it doesn't matter what order they run in.
    }
}



async function sendWeeklyAppointmentsEmail(mailer) {

    // send an email to the user with the weeks appointments.
    let startOfWeek = moment().startOf("isoWeek");
    let endOfWeek = moment().endOf("isoWeek");

    // get all users
    let allUsers = await UserModel.find({});
    // send all users emails
    for (let user of allUsers) {

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

        // send the email containing the users appointments.
        mailer.weeksAppointments(user, weeksAppointments).send();
    }

}

// Remove any expired guest accounts from the database.
async function removeExpiredGuests() {
    let allGuests = await GuestModel.find({});
    let oneWeekAgo = moment().subtract(1, "week");

    let deletedCount = 0;
    let totalGuests = allGuests.length;

    // Loop through the guest accounts and check to see if they're expired or not.
    for (let guest of allGuests) {

        // Get all the appointments within the last week that the guest is involved in.
        let involvedAppointments = await AppointmentModel.find({
            clients: guest._id,
            startTime: {
                $gt: oneWeekAgo
            }
        });

        // If the guest has not been involved in an appointment in the last week and has no appointments coming up, they are safe to be deleted. 
        if (!involvedAppointments || involvedAppointments.length < 1) {
            // Also check that the guest account has existed for more than a week.
            if (moment(guest.timeCreated).isBefore(oneWeekAgo)) {
                // delete the guest account
                await GuestModel.findByIdAndDelete(guest._id);
                deletedCount++;
            }
        }

    }
    Logger.info(`Deleted ${deletedCount}/${totalGuests} guest accounts. `)
}

module.exports = Scheduler;