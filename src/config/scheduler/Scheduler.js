// Run maintenace.
const cron = require('node-cron');
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const moment = require("moment");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");

function start() {

  console.log("- Starting cron jobs...");

  // remove expired password reset tokens from the database
  // "0 * * * *" = Every hour (https://crontab.guru)
  cron.schedule("0 * * * *", async () => {
    let expiryTime = moment().subtract(30, "minutes");
    let deletedResets = await PasswordResetModel.deleteMany({
      timestamp: {
        $lt: expiryTime
      },
      isGuest: false
    });
    console.log(`Removed ${deletedResets.deletedCount}/${deletedResets.n} password resets.`);
  });

  // remove client password resets (these are allowed to stay for longer as they are used to activate client accounts.)
  cron.schedule("0 0 * * *", async () => {
    let expiryTime = moment().subtract(1, "month");
    let deletedResets = await PasswordResetModel.deleteMany({
      timestamp: {
        $lt: expiryTime
      },
      isGuest: true
    });
    console.log(`Removed ${deletedResets.deletedCount}/${deletedResets.n} client password resets.`)
  })

  // remove guest accounts no longer in use.
  cron.schedule("* * * * *", async () => {
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
  });

}



module.exports = {
  start
}