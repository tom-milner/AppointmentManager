const moment = require("moment");
const MongooseObjectId = require("mongoose").Types.ObjectId;


// This function creates a moment object on the same day as another, but with a different time.
module.exports = {

  getMomentFromTimeString(originalMoment, time) {
    let parts = time.split(":");
    let hours = parts[0];
    let minutes = parts[1];
    let newMoment = moment(originalMoment).startOf("day");
    // edit moment, changing hours and minutes
    return newMoment.hours(hours).minutes(minutes);
  },


  validateMongoId(id) {
    let isValid = MongooseObjectId.isValid(id);
    if (!isValid) return false;
    let newId = MongooseObjectId(id);
    if (newId != id) return false;
    return true;
  }
}