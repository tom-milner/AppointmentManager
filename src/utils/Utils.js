const moment = require("moment");


// This function creates a moment object on the same day as another, but with a different time.
module.exports = {

getMomentFromTimeString(originalMoment, time) {
  let parts = time.split(":");
  let hours = parts[0];
  let minutes = parts[1];
  let newMoment = moment(originalMoment).startOf("day");
  // edit moment, changing hours and minutes
  return newMoment.hours(hours).minutes(minutes);
}
}