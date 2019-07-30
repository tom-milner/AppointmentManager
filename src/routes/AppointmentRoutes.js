var express = require("express");
var router = express.Router();

var AppointmentController = require("../controllers/AppointmentController");
var AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");

var Role = require("../models/Role");

// Always requires users to be logged on
router.use(AuthenticationMiddleware.isLoggedIn);

// Get all appointments of a specific user
router.get("/:userId", AuthenticationMiddleware.roleCheck(Role.User, true), AppointmentController.getAppointmentsOfUser);

// Get all appointments
router.get("/", AuthenticationMiddleware.roleCheck(Role.Admin), AppointmentController.getAllAppointments);

// Insert new appointment
router.post("/", AppointmentController.insertAppointment);



module.exports = router;