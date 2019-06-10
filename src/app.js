// import necessary packages
const express = require('express');
const morgan = require('morgan'); // for logging
const dotenv = require("dotenv"); // for accessing environment variables
const bodyParser = require("body-parser"); // for accessing data stored in body of request
const cors = require("cors"); // for getting around CORS

// import necessary modules
const config = require("./config/config");
const routes = require("./routes");
const db = require("./config/database")

// use express
const app = express();

// setup middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
// load in environment variables
dotenv.config();

// import routes
app.use(routes);

// initialise database connection
db.init();


// initialise server 
app.listen(config.port, function () {
    console.log(`started on port ${config.port}`);
});