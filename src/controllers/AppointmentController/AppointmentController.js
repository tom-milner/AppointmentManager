// Import required models
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const AppointmentControllerHelpers = require("./AppointmentControllerHelpers");
const AppResponse = require("../../struct/AppResponse");
const Role = require("../../models/Role");
const moment = require("moment");
const Mailer = require("../../struct/mailer/Mailer");

// Fetch all appointments regardless

// This is never used in the app, it is only here for testing purposes.
async function getAllAppointments(req, res) {
  const response = new AppResponse(res);
  try {
    // get appointments and sort them
    let allAppointments = await AppointmentModel.find({}).sort({
      startTime: "asc"
    });
    // return the appointments
    return response.success("Successfully returned appointments", allAppointments);
  } catch (error) {
    console.error(error);
    return response.failure("An error has occured sending appointments");
  }
}

function getAppointmentsOfUser({
  reduced,
  isCounsellor
}) {
  return async function (req, res) {

    const response = new AppResponse(res);
    // dynamically construct mongoose query
    const appointmentQuery = AppointmentModel.find();

    // get info from params + query
    const userId = req.params.userId;
    let fromTime = req.query.fromTime;

    // Check to see if user needs appointments from a certain time.
    if (fromTime) {
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
    appointmentQuery;

    // check limits
    let limit = parseInt(req.query.limit);
    if (limit) appointmentQuery.limit(limit);

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

      return response.success("Appointments returned successfully", {
        appointments: appointments
      });

    } catch (error) {
      console.log(error);
      // return an error message
      return response.failure("Error returning appointments.", 400);
    }
  };
}

// Insert new appointment into db
async function createAppointment(req, res) {
  const response = new AppResponse(res);

  try {
    // load  info from body
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

    // make sure the appointment type exists
    let appointmentType = await AppointmentControllerHelpers.getAppointmentType(
      appointmentTypeId
    );
    if (!appointmentType)
      throw {
        message: "Appointment type doesn't exist",
        code: 400
      };
    // calculate start time
    let appointmentStartTime = moment(req.body.startTime);

    // calculate end time
    let appointmentEndTime = moment(appointmentStartTime);
    appointmentEndTime.add(appointmentType.duration, "minutes");

    let appointmentInfo = {
      title: req.body.title,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      clientId: clientId,
      counsellorId: counsellorId,
      clientNotes: clientNotes,
      counsellorNotes: counsellorNotes,
      appointmentType: appointmentType,
      recurringNo: 0
    };



    // make sure all the appointments are available
    let readyAppointments = await AppointmentControllerHelpers.createAndCheckAllAppointments(appointmentInfo, appointmentType);
    // insert ready appointments into database.
    let createdAppointments = [];
    for (let appointment of readyAppointments) {
      let createdAppointment = await AppointmentControllerHelpers.insertAppointment(appointment);
      createdAppointments.push(createdAppointment);
    }


    // add full client information to the first appointment of the series.
    console.log(createdAppointments[0]);
    await createdAppointments[0].populate("clients").populate("counsellorId").execPopulate();
    // send clients email confirming appointment.
    let mailer = new Mailer();
    for (let client of createdAppointments[0].clients) {
      mailer.confirmAppointment(createdAppointments, client, createdAppointments[0].counsellorId).send();
    }

    // Send back new appointment
    return response.success("Appointment created successfully", {
      appointments: createdAppointments
    });
    // Catch any errors and respond appropriately
  } catch (error) {
    let errorMessage = error.message || "Error creating appointment.";
    let errorCode = error.code || 500;
    return response.failure(errorMessage, errorCode, {
      clashInfo: error.clashInfo,
    });
  }
}

async function updateAppointment(req, res) {
  const response = new AppResponse(res);

  let newAppointmentProperties = req.body.appointmentProperties;
  let appointmentId = req.params.appointmentId;

  try {
    // make sure clients can't edit other people's appointments.
    if (req.user.role == Role.Client) {
      let appointment = await AppointmentModel.findById(appointmentId);
      let validClient = appointment.clients.indexOf(req.user._id) > -1;
      if (!validClient)
        throw {
          message: "You do not have permission to edit this appointment.",
          code: 403
        };
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

    return response.success("Appointment updated successfully", {
      updatedAppointment: updatedAppointment
    });
  } catch (error) {
    let errorMessage = error.message || "Error updating appointment.";
    let errorCode = error.code || 400;
    return response.failure(errorMessage, errorCode);
  }
}

async function deleteAppointment(req, res) {
  const response = new AppResponse(res);

  let appointmentId = req.params.appointmentId;
  let deleteRecurring = req.body.deleteRecurring;

  try {
    let deletedAppointment = await AppointmentModel.findByIdAndDelete(
      appointmentId
    );
    if (!deletedAppointment)
      throw {
        message: "Appointment doesn't exist."
      };

    if (deleteRecurring) {
      // delete all recurring appointments
      console.log("deleting");
      let deletedRecurringSeries = await AppointmentModel.deleteMany({
        recurringSeriesId: deletedAppointment.recurringSeriesId
      });

      console.log(deletedRecurringSeries);
    }

    return response.success("Appointments deleted successfully.");
  } catch (error) {
    return response.failure(error.message || "Error deleting appointment", 400);
  }
}

// expose functions
module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentsOfUser,
  updateAppointment,
  deleteAppointment
};