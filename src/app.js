var express = require('express');
var logger = require('morgan');

// import configuration settings
const config = require("./config/config");
const routes = require("./routes");

const app = express();
app.use(routes);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(config.port, function () {
    console.log(`started on port ${config.port}`);
});