const express = require("express");
const router = express.Router();

const AppointmentTypeController = require("../controllers/AppointmentTypeController");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
const AppointmentTypeControllerPolicy = require("../policies/AppointmentTypeControllerPolicy");
const Role = require("../models/Role");


// Appointment Type Routes
// All these routes are under the endpoint "appointments/type/"
// Therefore they inherit the middleware declared in appointments.
// For example, all these routes will require authentication as all the appointments routes do.

// Create a new appointment type
router.post("/", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeControllerPolicy.createAppointmentType, AppointmentTypeController.createAppointmentType);

// Get all appointment types
router.get("/", AppointmentTypeController.getAllAppointmentTypes);

// Update an appointment type
router.post("/update/:appointmentTypeId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeControllerPolicy.updateAppointmentType, AppointmentTypeController.updateAppointmentType)

module.exports = router;