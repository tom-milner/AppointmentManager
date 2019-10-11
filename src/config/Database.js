// import necessary packages
const mongoose = require("mongoose"); // needed for interacting with database

class Database {

  init(url) {
    console.log("- Initializing database...")
    // make sure url is given
    if (url == null) {
      throw ("You have not specified a mongoose connection URL.")
    }

    // connect to database
    mongoose.set('useCreateIndex', true)
    return mongoose.connect(url, {
      useNewUrlParser: true
    }).then(function (result) {
      console.log("✓ Database Connection.")
    }).catch(function (err) {
      throw (`Error connecting to MongoDB database at ${url}`);
    });

  }

}
module.exports = Database;