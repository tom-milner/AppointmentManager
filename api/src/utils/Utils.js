const moment = require("moment");
const MongooseObjectId = require("mongoose").Types.ObjectId;


// This function creates a moment object on the same day as another, but with a different time.
function getMomentFromTimeString(originalMoment, time) {
  let parts = time.split(":");
  let hours = parts[0];
  let minutes = parts[1];
  let newMoment = moment(originalMoment).startOf("day");
  // edit moment, changing hours and minutes
  return newMoment.hours(hours).minutes(minutes);
}


function validateMongoId(id) {
  let isValid = MongooseObjectId.isValid(id);
  if (!isValid) return false;
  let newId = MongooseObjectId(id);
  if (newId != id) return false;
  return true;
}

function getDuplicateMongoEntryKey(message) {

  // Mongo "duplicate entry" error messages don't return the actual key that was a duplicate, so function this extracts it from the message.

  // This is the standard error message:
  //    "E11000 duplicate key error collection: appointment_manager.usermodels index: email_1 dup key: { : "tom.milner@gmail.com" }"

  // Get the index of the character that comes directly *after* "index: "
  let firstIndex = message.indexOf("index: ") + "index: ".length
  let secondHalf = message.substring(firstIndex);

  // split the message on "_", as there is always an underscore after the key name. This returns an array, of which the first element is the key we're looking for.
  let key =
    secondHalf.split("_")[0];

  // capitalise first letter and return key.
  return key.charAt(0).toUpperCase() + key.slice(1);

}


module.exports = {
  getMomentFromTimeString,
  getDuplicateMongoEntryKey,
  validateMongoId
}