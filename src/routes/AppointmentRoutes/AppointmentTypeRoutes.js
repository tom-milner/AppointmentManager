const express = require("express");
const router = express.Router();

const AppointmentTypeController = require("../../controllers/AppointmentTypeController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const AppointmentTypeControllerPolicy = require("../../policies/AppointmentTypeControllerPolicy");
const Role = require("../../models/Role");


// Appointment Type Routes
// All these routes are under the endpoint "appointments/type/"

// Get all appointment types
router.get("/", AppointmentTypeController.getAllAppointmentTypes);


router.use(AuthenticationMiddleware.isLoggedIn);

// Create a new appointment type
router.post("/", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeControllerPolicy.createAppointmentType, AppointmentTypeController.createAppointmentType);


// Update an appointment type
router.post("/:appointmentTypeId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeControllerPolicy.updateAppointmentType, AppointmentTypeController.updateAppointmentType)

// delete an appointment route
router.post("/delete/:appointmentTypeId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeControllerPolicy.deleteAppointmentType, AppointmentTypeController.deleteAppointmentType)
module.exports = router;