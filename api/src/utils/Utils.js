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
  },

  getDuplicateMongoEntryKey(message) {

    // Mongo "duplicate entry" error messages don't return the actual key that was a duplicate, so function this extracts it from the message.

    // This is the standard errormessage:
    // "E11000 duplicate key error collection: appointment_manager.usermodels index: email_1 dup key: { : "tom.milner@gmail.com" }"

    // Get the string *after* "index: "
    let firstIndex = message.indexOf("index: ") + "index: ".length
    let latterHalf = message.substring(firstIndex);

    // split the message on "_", as there is always an underscore after the key name. This returns an array, of which the first element is the key we're looking for.
    let key =
      latterHalf.split("_")[0];

    // capitalise first letter and return key.
    return key.charAt(0).toUpperCase() + key.slice(1);

  }
}