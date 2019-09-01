const express = require('express');
const app = express();

// Load in environment variables
const dotenv = require("dotenv");
dotenv.config();

// Automatic CORS-policy handling
const cors = require("cors");
app.use(cors());

// Logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Handle POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// load application routes
const routes = require("./routes");
app.use(routes);

// Connect to the database and start the application
(async () => {
    const database = require("./config/database")
    if (await database.initialize(process.env.DB_URL)) {
        // Database is required, so only start server if database connection can be established
        app.listen(process.env.PORT, function () {
            console.log(`started on port ${process.env.PORT}`);
        });
    }
})();