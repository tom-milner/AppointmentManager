// import necessary packages
const mongoose = require("mongoose"); // needed for interacting with database

// function to establish connection to database
async function initialize(url) {

  // make sure url is given
  if (url == null) {
    console.error("You have not specified a mongoose connection URL.")
    return false;
  }

  // connect to database
  mongoose.set('useCreateIndex', true)
  return mongoose.connect(url, {
    useNewUrlParser: true
  }).then(function (res) {
    return true;
  }).catch(function (err) {
    console.log(`Error connecting to MongoDB database at ${url}`);
    console.log(err);
    return false;
  });

}

module.exports = {
  initialize
};