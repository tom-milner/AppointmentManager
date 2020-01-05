const MongooseObjectId = require("mongoose").Types.ObjectId;

// Chech that a supplied ID is of the mongoose format.
function validateMongoId(id) {
    // The built in validation function - this isn't enough on it's own as it will return true for some 12-character strings that aren't valid Mongo Ids.. 
    let isValid = MongooseObjectId.isValid(id);
    if (!isValid) return false;
    // Create a new Id from the given Id. If the id was originally valid, this will return the same id as was input.
    // If the original Id was invalid, this will return a new Id. 
    // We can therefore check the validity of the Id by seeing if it has changed.
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
    // 
    let secondHalf = message.substring(firstIndex);

    // split the message on "_", as there is always an underscore after the key name. This returns an array, of which the first element is the key we're looking for.
    let key =
        secondHalf.split("_")[0];

    // capitalise first letter and return key.
    return key.charAt(0).toUpperCase() + key.slice(1);

}


module.exports = {
    getDuplicateMongoEntryKey,
    validateMongoId
}