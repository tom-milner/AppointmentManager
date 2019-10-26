// Run maintenace.
const cron = require('node-cron');
const moment = require("moment");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const Database = require("../Database");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Mailer = require("../mailer/Mailer");
const UserModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const Config = require("../Config");
const Logger = require("../Logger")(module);


class Scheduler {


    constructor() {
        this.mailer = new Mailer();
    }


    start() {
        Logger.info("Starting Scheduler...")


        // for (let i = 0; i < 10; i++) {
        //     sendWeeklyAppointmentsEmail(this.mailer);
        // }
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

    // get all counsellors
    let allUsers = await UserModel.find({});

    // send all counsellor emails
    for (let user of allUsers) {
        let weeksAppointments = await AppointmentModel.find({
            counsellorId: user._id,
            startTime: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        }).populate("clients");
        if (weeksAppointments.length < 1) {
            weeksAppointments = await AppointmentModel.find({
                clients: user._id,
                startTime: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            }).populate("clients");
        }
        // send the email containing the users appointments.
        mailer.weeksAppointments(user, weeksAppointments).send();
    }

}


async function removeExpiredGuests() {
    let allGuests = await GuestModel.find({});
    let oneWeekAgo = moment().subtract(1, "week");

    let deletedCount = 0;
    let totalGuests = allGuests.length;

    for (let guest of allGuests) {
        let involvedAppointments = await AppointmentModel.find({
            clients: guest._id,
            startTime: {
                $gt: oneWeekAgo
            }
        });
        if (!involvedAppointments || involvedAppointments.length < 1) {
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