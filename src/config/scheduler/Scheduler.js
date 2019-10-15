// Run maintenace.
const cron = require('node-cron');
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const moment = require("moment");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Mailer = require("../mailer/Mailer");
const UserModel = require("../../models/MongooseModels/UserModels/CounsellorModel");

class Scheduler {


  constructor() {
    this.mailer = new Mailer();
  }


  start() {
    console.log("- Starting Scheduler...");

    // remove expired password reset tokens from the database
    // "0 * * * *" = Every hour (https://crontab.guru)
    cron.schedule("0 * * * *", () => removeExpiredPasswordResets());

    // Every Day
    cron.schedule("0 0 * * *", () => {
      // remove client password resets (these are allowed to stay for longer as they are used to activate client accounts.)
      removeExpiredGuestPasswordResets();

      // remove any expired guest accounts.
      removeExpiredGuests()
    });

    // Every Week
    // 0 0 * * 0

    cron.schedule("0 0 * * 0", () => sendWeeklyAppointmentsEmail(this.mailer));

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
  console.log(`Deleted ${deletedCount}/${totalGuests} guest accounts. `)
}


async function removeExpiredGuestPasswordResets() {
  let expiryTime = moment().subtract(1, "month");
  let deletedResets = await PasswordResetModel.deleteMany({
    timestamp: {
      $lt: expiryTime
    },
    isGuest: true
  });
  console.log(`Removed ${deletedResets.deletedCount}/${deletedResets.n} client password resets.`)
}

async function removeExpiredPasswordResets() {
  let expiryTime = moment().subtract(30, "minutes");
  let deletedResets = await PasswordResetModel.deleteMany({
    timestamp: {
      $lt: expiryTime
    },
    isGuest: false
  });
  console.log(`Removed ${deletedResets.deletedCount}/${deletedResets.n} password resets.`);
}



module.exports = Scheduler;