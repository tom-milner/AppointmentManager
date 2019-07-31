const express = require("express");
const router = express.Router();

let AppointmentController = require("../controllers/AppointmentController");
let AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
let AppointmentControllerPolicy = require("../policies/AppointmentControllerPolicy");

let Role = require("../models/Role");

// Always requires users to be logged on
router.use(AuthenticationMiddleware.isLoggedIn);

// Get all appointments of a specific user
router.get("/:userId", AuthenticationMiddleware.roleCheck(Role.User, true), AppointmentController.getAppointmentsOfUser);

// Get all appointments
router.get("/", AuthenticationMiddleware.roleCheck(Role.Admin), AppointmentController.getAllAppointments);

// Insert new appointment
router.post("/", AppointmentControllerPolicy.insertAppointment, AppointmentController.insertAppointment);



module.exports = router;