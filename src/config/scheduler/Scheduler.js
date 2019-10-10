// Run maintenace.
const cron = require('node-cron');
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const moment = require("moment");


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
  cron.schedule("0 0 * * 1", async () => {
    let expiryTime = moment().subtract(1, "month");
    let deletedResets = await PasswordResetModel.deleteMany({
      timestamp: {
        $lt: expiryTime
      },
      isGuest: true
    });
    console.log(`Removed ${deletedResets.deletedCount}/${deletedResets.n} client password resets.`)
  })

}



module.exports = {
  start
}