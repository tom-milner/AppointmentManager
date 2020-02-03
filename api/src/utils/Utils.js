const MongooseObjectId = require("mongoose").Types.ObjectId;

// This file contains miscellaneous utility functions that are needed frequently throughout the API by many different files.

// Chech that a supplied ID is of the mongoose format.

/**
 * This function asserts that a MongoDB ID is valid.
 * @param {String} id - The MongoDB ID to validate.
 */
function validateMongoId(id) {
  // The built in validation function - this isn't enough on it's own as it will return true for some 12-character strings that aren't valid Mongo Ids..
  let isValid = MongooseObjectId.isValid(id);
  if (!isValid) return false;

  // Create a new ID from the given ID. If the id was originally valid, this will return the same id as was input.
  // If the original ID was invalid, this will return a new ID.
  // We can therefore check the validity of the ID by seeing if it has changed.
  let newId = MongooseObjectId(id);
  if (newId != id) return false;
  return true;
}

/**
 * This function extracts what property triggered a MongoDB 'duplicate entry' warning, as there is no built in functionality for this.
 * @param {String} message - The MongoDB error message.
 */
function getDuplicateMongoEntryKey(message) {
  // This is the standard error message:
  //    "E11000 duplicate key error collection: appointment_manager.usermodels index: email_1 dup key: { : "tom.milner@gmail.com" }"

  // This function extracts the key that caused the error.

  // Get the index of the character that comes directly *after* "index: "
  let firstIndex = message.indexOf("index: ") + "index: ".length;

  let secondHalf = message.substring(firstIndex);

  // Split the message on "_", as there is always an underscore after the key name. This returns an array, of which the first element is the key we're looking for.
  let key = secondHalf.split("_")[0];

  // Capitalise the first letter and return the found key.
  return key.charAt(0).toUpperCase() + key.slice(1);
}

module.exports = {
  getDuplicateMongoEntryKey,
  validateMongoId
};
