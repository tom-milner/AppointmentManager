var express = require("express");
var router = express.Router();

var AppointmentController = require("../controllers/AppointmentController");
var AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");

var Role = require("../models/Role");

// always requires users to be logged on
router.use(AuthenticationMiddleware.isLoggedIn);


// get all appointments
router.get("/", AuthenticationMiddleware.roleCheck(Role.Admin), AppointmentController.getAllAppointments);

// insert new appointment
router.post("/", AppointmentController.insertAppointment);



module.exports = router;