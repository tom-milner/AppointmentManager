// Import required models
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const AppointmentControllerHelpers = require("./AppointmentControllerHelpers");
const ErrorController = require("../ErrorController");
const Role = require("../../models/Role");
const moment = require("moment");

// Fetch all appointments regardless

// This is never used in the app, it is only here for testing purposes.
async function getAllAppointments(req, res) {
  try {
    // get appointments and sort them
    let allAppointments = await AppointmentModel.find({}).sort({
      startTime: "asc"
    }).populate("appointmentType");
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
      // include counsellor notes
      appointmentQuery.select("+counsellorNotes");
    } else {
      appointmentQuery.where("clients", userId);

    }

    // sort appointments in ascending order
    appointmentQuery.sort({
      startTime: "asc"
    });

    // make appointments contain their appointment type
    appointmentQuery.populate("appointmentType");

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
          title: isCounsellor ? "Counsellor Appointment" : appointment.title
        }));
      }

      res.status(200).send({
        success: true,
        message: "Appointments returned successfully",
        appointments: appointments
      });
    } catch (error) {
      console.log(error);
      // return an error message
      ErrorController.sendError(res, "Error returning appointments.", 400);

    }
  };
}

// Insert new appointment into db
async function insertAppointment(req, res) {
  try {
    // load  info from body
    const appointmentStartTime = moment(req.body.startTime);
    const appointmentTypeId = req.body.typeId;
    const counsellorId = req.body.counsellorId;
    let clientId, counsellorNotes, clientNotes;

    // only counsellors can make appointments for other people and set counsellor notes
    if (req.user.role >= Role.Counsellor) {
      clientId = req.body.clientId;
      counsellorNotes = req.body.counsellorNotes;

    } else {
      // clients can only make appointments for themselves.
      clientId = req.user._id;
      clientNotes = req.body.clientNotes;
    }

    // make sure the appointment type exist
    let appointmentType = await AppointmentControllerHelpers.getAppointmentType(appointmentTypeId);
    if (!appointmentType) throw {
      message: "Appointment type doesn't exist",
      code: 400
    }
    // calculate end time
    let appointmentEndTime = moment(appointmentStartTime);
    appointmentEndTime.add(appointmentType.duration, "minutes");

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



    // Create new appointment model
    let appointment = new AppointmentModel({
      title: req.body.title,
      startTime: appointmentStartTime,
      // TODO: add buffer to end time
      endTime: appointmentEndTime,
      appointmentType: appointmentTypeId,
      // This is an array as I plan on adding support for multiple clients. This is an extension objective.
      clients: [clientId],
      isApproved: false,
      counsellorId: counsellorId,
      clientNotes: clientNotes,
      counsellorNotes: counsellorNotes
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
    let errorMessage = error.message || "Error creating appointment.";
    let errorCode = error.code || 500;
    ErrorController.sendError(res, errorMessage, errorCode);
  }
}

async function updateAppointment(req, res) {

  let newAppointmentProperties = req.body.appointmentProperties;
  let appointmentId = req.params.appointmentId;

  try {
    // make sure clients can't edit other people's appointments.
    if (req.user.role == Role.Client) {
      let appointment = await AppointmentModel.findById(appointmentId);
      let validClient = appointment.clients.indexOf(req.user._id) > -1;
      if (!validClient) throw {
        message: "You do not have permission to edit this appointment.",
        code: 403
      }
    }

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