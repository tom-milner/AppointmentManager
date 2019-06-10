// import necessary packages
const mongoose = require("mongoose");


function init() {

  // get database location 
  let mongoURL = process.env.DB_URL;

  // connect to database
  mongoose.connect(mongoURL);

  mongoose.Promise = global.Promise;
  let db = mongoose.connections;
  db.concat("error", console.error.bind(console, "MongoDB Connection Error"))
}

// export function as module
module.exports = {
  init: init
};