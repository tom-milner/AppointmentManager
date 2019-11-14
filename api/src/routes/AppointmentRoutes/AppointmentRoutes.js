const express = require("express");
const router = express.Router();

const AppointmentTypeRoutes = require("./AppointmentTypeRoutes");
let AppointmentController = require("../../controllers/AppointmentController/AppointmentController");
let AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
let AppointmentControllerPolicy = require("../../policies/AppointmentControllerPolicy");
let Role = require("../../models/Role");

// These routes are all under "/appointments"


// Get all  reduced appointments of a counsellor.
router.get(
    "/counsellor/:userId",
    AppointmentController.getAppointmentsOfUser({
        reduced: true,
        isCounsellor: true
    })
);


// import Appointment Type Routes
router.use("/type", AppointmentTypeRoutes);



// Always require users to be logged in for the following routes - appointments contain personal information
router.use(AuthenticationMiddleware.isLoggedIn);

// Get all appointments of a specific user
router.get(
    "/client/full/:userId",
    AuthenticationMiddleware.roleCheck({
        role: Role.Counsellor,
        userSpecific: true
    }),
    AppointmentController.getAppointmentsOfUser({
        isCounsellor: false,
        reduced: false
    })
);


// get reduced appointments about user
router.get(
    "/client/:userId",
    AuthenticationMiddleware.roleCheck({
        role: Role.Client,
        userSpecific: true
    }),
    AppointmentController.getAppointmentsOfUser({
        isCounsellor: false,
        reduced: true
    })
);




// get all full appointments of a counsellor
router.get(
    "/counsellor/full/:userId",
    AuthenticationMiddleware.roleCheck({
        role: Role.Counsellor
    }),
    AppointmentController.getAppointmentsOfUser({
        reduced: false,
        isCounsellor: true
    })
);

// Get all appointments
router.get(
    "/",
    AuthenticationMiddleware.roleCheck({
        role: Role.Admin
    }),
    AppointmentController.getAllAppointments
);

// Insert new appointment
router.post(
    "/",
    AppointmentControllerPolicy.createAppointment,
    AppointmentController.createAppointment
);



// update an existing appointment
router.post(
    "/:appointmentId",
    AuthenticationMiddleware.roleCheck({
        role: Role.Client,
    }),
    AppointmentControllerPolicy.updateAppointment,
    AppointmentController.updateAppointment
);

// delete an appointment
router.post("/delete/:appointmentId",
    AuthenticationMiddleware.roleCheck({
        role: Role.Client,
        userSpecific: true
    }),
    AppointmentControllerPolicy.deleteAppointment,
    AppointmentController.deleteAppointment)

module.exports = router;