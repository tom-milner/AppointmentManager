const express = require("express");
const router = express.Router();

const AppointmentTypeController = require("../../controllers/AppointmentTypeController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const AppointmentTypeControllerPolicy = require("../../policies/AppointmentTypeControllerPolicy");
const Roles = require("../../models/Roles");

// Appointment Type Routes
// All these routes are under the endpoint "appointments/type/", and concern any operations to do with appointment types.

// Get all appointment types
router.get("/", AppointmentTypeController.getAllAppointmentTypes);

// Users must be logged in for all these routes.
router.use(AuthenticationMiddleware.isLoggedIn);

// Create a new appointment type
router.post(
  "/",
  AuthenticationMiddleware.roleCheck({
    role: Roles.COUNSELLOR
  }),
  AppointmentTypeControllerPolicy.updateAppointmentType({
    isNew: true
  }),
  AppointmentTypeController.createAppointmentType
);

// Update an appointment type
router.post(
  "/:appointmentTypeId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.COUNSELLOR
  }),
  AppointmentTypeControllerPolicy.updateAppointmentType({
    isNew: false
  }),
  AppointmentTypeController.updateAppointmentType
);

// delete an appointment route
router.post(
  "/delete/:appointmentTypeId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.COUNSELLOR
  }),
  AppointmentTypeControllerPolicy.deleteAppointmentType,
  AppointmentTypeController.deleteAppointmentType
);
module.exports = router;
