// Import required models
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const AppointmentControllerHelpers = require("./AppointmentControllerHelpers");
const ErrorController = require("../ErrorController");
const moment = require("moment");

// Fetch all appointments regardless
async function getAllAppointments(req, res) {
  try {
    // get appointments and sort them
    let allAppointments = await AppointmentModel.find({}).sort({
      startTime: "asc"
    }).populate("AppointmentTypeModel");
    // return the appointments
    res.send(allAppointments);
  } catch (error) {
    console.error(error);
    ErrorController.sendError(res, "An error has occured sending appointments");
  }
}

function getAppointmentsOfUser({
  reduced,
  isCounsellor
}) {
  return async function (req, res) {
    // TODO: create policy for this function

    // dynamically construct mongoose query
    const appointmentQuery = AppointmentModel.find();

    // get info from params + query
    const userId = req.params.userId;
    let fromTime = req.query.fromTime;

    // Check to see if user needs appointments from a certain time.
    if (fromTime) {
      fromTime = moment(req.params.fromTime);
      // adjust query so that only appointments after fromTime will be selected.
      appointmentQuery.where("startTime").gte(fromTime);
    }

    // check whether we should seach for counsellor or client
    if (isCounsellor) {
      appointmentQuery.where("counsellorId", userId);
    } else {
      appointmentQuery.where("clients", userId);
      // remove counsellor notes
      appointmentQuery.select("-counsellorNotes");
    }

    // sort appointments in ascending order
    appointmentQuery.sort({
      startTime: "asc"
    });

    // make appointments contain their appointment type
    appointmentQuery.populate("AppointmentTypeModel");


    try {
      // execute the query
      let appointments = await appointmentQuery.exec();

      // check whether user wants reduced appointments or not.
      if (reduced) {
        // remove everything but startTime, endTime and title
        // this was originally implemented as a projection, however mongo doesn't support both inclusion and exclusion on a single projection.
        appointments = appointments.map(appointment => ({
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          // Set title to "Counsellor Appointment" so as not to expose any clients.
          title: "Counsellor Appointment"
        }));
      }

      res.status(200).send({
        success: true,
        message: "Counsellor appointments returned successfully",
        appointments: appointments
      });
    } catch (error) {
      console.log(error);
      // return an error message
      ErrorController.sendError(res, "Error returning counsellor's appointments.", 400);

    }
  };
}

// Insert new appointment into db
async function insertAppointment(req, res) {
  try {
    // load  info from body
    const appointmentStartTime = moment(req.body.startTime);
    const appointmentDuration = req.body.duration; // In Minutes
    const appointmentTypeId = req.body.typeId;
    const appointmentEndTime = moment(req.body.startTime).add(
      appointmentDuration,
      "minutes"
    );
    const counsellorId = req.body.counsellorId;
    const clientId = req.user._id;

    let error;
    // check to see if client is free
    error = await AppointmentControllerHelpers.checkClientAvailability(
      appointmentStartTime,
      appointmentEndTime,
      clientId
    );
    // throw error
    if (error) throw error;

    // check to see if counsellor is free
    error = await AppointmentControllerHelpers.checkCounsellorAvailablity(
      appointmentStartTime,
      appointmentEndTime,
      counsellorId
    );
    // throw the error
    if (error) throw error;

    // make sure the appointment type exist
    error = await AppointmentControllerHelpers.validateAppointmentType(appointmentTypeId);
    if (error) throw error;


    // Create new appointment model
    let appointment = new AppointmentModel({
      title: req.body.title,
      startTime: appointmentStartTime,
      // TODO: add buffer to end time
      endTime: appointmentEndTime,
      appointmentType: appointmentTypeId,
      clients: [req.user],
      isApproved: false,
      counsellorId: counsellorId,
      clientNotes: req.body.clientNotes
    });


    // Save the model to the database
    let createdAppointment = await appointment.save()

    // Send back new appointment
    res.send({
      success: true,
      message: "Appointment created successfully",
      appointment: createdAppointment
    });

    // Catch any errors and respond appropriately
  } catch (error) {
    console.log(error);

    let errorMessage = error.message || "Error creating appointment";
    let errorCode = error.code || 500;

    ErrorController.sendError(res, errorMessage, errorCode);
  }
}

async function updateAppointment(req, res) {
  try {
    let newAppointmentProperties = req.body.appointmentProperties;
    let appointmentId = req.params.appointmentId;

    let updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      newAppointmentProperties, {
        // get the newly created appointment
        new: true,
        runValidators: true
      }
    );

    if (!updatedAppointment) {
      throw {
        message: "Appointment doesn't exist.",
        code: 400
      };
    }

    res.status(200).send({
      success: true,
      message: "Appointment updated successfully",
      updatedAppointment: updatedAppointment
    });
  } catch (error) {

    let errorMessage = error.message || "Error updating appointment."
    let errorCode = error.code || 400;
    ErrorController.sendError(res, errorMessage, errorCode);
  }
}


// expose functions
module.exports = {
  insertAppointment,
  getAllAppointments,
  getAppointmentsOfUser,
  updateAppointment
};