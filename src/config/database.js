// import necessary packages
const mongoose = require("mongoose"); // needed for interacting with database

// function to establish connection to database
async function initialize(url) {

  // make sure url is given
  if (url == null) {
    console.error("You have not specified a mongoose connection URL.")
    return false;
  }

  try {
    // connect to database
    mongoose.connect(url);
    return true;
  } catch (error) {
    console.log(`Error connecting to MongoDB database at ${url}`);
    console.log(error);
  }

  return false;
}

module.exports = {
  initialize
};