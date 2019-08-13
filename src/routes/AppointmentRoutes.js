const express = require("express");
const router = express.Router();

let AppointmentController = require("../controllers/AppointmentController");
let AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
let AppointmentControllerPolicy = require("../policies/AppointmentControllerPolicy");

let Role = require("../models/Role");

// Always requires users to be logged on
router.use(AuthenticationMiddleware.isLoggedIn);

// Get all appointments of a specific user
router.get("/client/:userId", AuthenticationMiddleware.roleCheck({
  role: Role.User,
  userSpecific: true
}), AppointmentController.getAppointmentsOfClient);

// Get all future appointments of a counsellor.
router.get("/counsellor/:userId", AuthenticationMiddleware.roleCheck({
  role: Role.User,
}), AppointmentController.getFutureAppointmentsOfCounsellor);

// Get all appointments
router.get("/", AuthenticationMiddleware.roleCheck({
  role: Role.Admin
}), AppointmentController.getAllAppointments);

// Insert new appointment
router.post("/", AppointmentControllerPolicy.insertAppointment, AppointmentController.insertAppointment);



module.exports = router;