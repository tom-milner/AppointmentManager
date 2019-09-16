// Import required models
const AppointmentModel = require("../models/MongooseModels/AppointmentModel");
const CounsellorModel = require("../models/MongooseModels/CounsellorModel");
const moment = require("moment");

// Fetch all appointments regardless
async function getAllAppointments(req, res) {
  try {
    // get appointments and sort them
    let allAppointments = await AppointmentModel.find({}).sort({
      startTime: "asc"
    });
    // return the appointments
    res.send(allAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "An error has occured fetching all appointments"
    });
  }
}

function getAppointmentsOfUser({ reduced, isCounsellor }) {
  return async function(req, res) {
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
      res.status(400).send({
        success: false,
        message: "Error returning counsellor's appointments."
      });
    }
  };
}

// Insert new appointment into db
async function insertAppointment(req, res) {
  try {
    // load  info from body
    console.log(req.body.startTime);
    const appointmentStartTime = moment(req.body.startTime);
    console.log(appointmentStartTime);
    const appointmentDuration = req.body.duration; // In Minutes
    const appointmentEndTime = moment(req.body.startTime).add(
      appointmentDuration,
      "minutes"
    );
    const counsellorId = req.body.counsellorId;
    const clientId = req.user._id;

    let error;
    // check to see if client is free
    error = await checkClientAvailability(
      appointmentStartTime,
      appointmentEndTime,
      clientId
    );
    // throw error
    if (error) throw error;

    // check to see if counsellor is free
    error = await checkCounsellorAvailablity(
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
      clients: [req.user],
      isApproved: false,
      counsellorId: counsellorId,
      clientNotes: req.body.clientNotes
    });

    // Save the model to the database
    await appointment.save(function(err, newAppointment) {
      if (err) {
        console.log(err);
        throw {
          message: "Database error.",
          code: 500
        };
      } else {
        // Send back new appointment
        res.send({
          success: true,
          message: "Appointment created successfully",
          appointment: newAppointment
        });
      }
    });

    // Catch any errors and respond appropriately
  } catch (error) {
    res.status(error.code || 500).send({
      message: error.message || "Error creating appointment",
      success: false
    });
  }
}

async function updateAppointment(req, res) {
  try {
    let newAppointmentProperties = req.body.appointmentProperties;
    let appointmentId = req.params.appointmentId;

    let updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      newAppointmentProperties,
      {
        new: true
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
    res.status(error.code || 400).send({
      success: false,
      message: error.message || "Error updating appointment"
    });
  }
}

// Helper functions - not called directly by route handler

async function checkClientAvailability(
  desiredStartTime,
  desiredEndTime,
  clientId
) {
  // check to see if client has any clashing appointments
  let clashingAppointments = await AppointmentModel.find({
    clients: clientId,
    // check to see if any of the clients have any other appointments have start or end times that occur between the desired start and end times of the new appointment.
    $or: [
      {
        $and: [
          {
            startTime: {
              $lte: desiredEndTime
            }
          },
          {
            startTime: {
              $gte: desiredStartTime
            }
          }
        ]
      },
      {
        $and: [
          {
            endTime: {
              $gte: desiredStartTime
            }
          },
          {
            endTime: {
              $lte: desiredEndTime
            }
          }
        ]
      }
    ]
  });
  // if any clashing appointments are found, reject the new appointment
  if (clashingAppointments.length > 0) {
    return {
      message: "Client is not available at this time.",
      code: 200
    };
  }
}

async function checkCounsellorAvailablity(
  desiredStartTime,
  desiredEndTime,
  counsellorId
) {
  console.log(desiredStartTime.toString());
  // First check to see if counsellor is working the required day.
  const counsellor = await CounsellorModel.findById(counsellorId); // Get the counsellor from the database.
  let availableWorkDays = counsellor.workingDays;

  // get Day string from start time e.g. "Monday" (we're assuming no appointments run over 2 days)
  let requiredDay = desiredStartTime.format("dddd");

  // check counsellor is working on given day.
  let validDay = availableWorkDays.find(day => day.name == requiredDay);

  // if counsellor isn't working that day, return an error
  if (!validDay) {
    return {
      message: `Counsellor is not available on ${requiredDay}.`,
      code: 200
    };
  }
  // Now check if counsellor is working the required hours.

  // create new moment objects for requested day containing the start and end times. The moment objects are needed for reliable comparison.
  let startOfDay = getMomentFromTimeString(
    desiredStartTime,
    validDay.startTime
  );
  let endOfDay = getMomentFromTimeString(desiredEndTime, validDay.endTime);

  // check start and end times are valid (Counsellor is working on during the requested appointment time.).
  let timeIsValid =
    desiredStartTime.isBetween(startOfDay, endOfDay, null, []) &&
    desiredEndTime.isBetween(startOfDay, endOfDay, null, []); // AND operation - counsellor must be free for both the start and end.

  // If the required time isn't valid, return an error.
  if (!timeIsValid) {
    return {
      message: "Counsellor is not working at that time",
      code: 200
    };
  }

  console.log(timeIsValid);

  // Now we know that the counsellor is working during the requested times, we need to check to see if the desired time clashes with any other appointments.

  // get all appointments of counsellor where an appointment either starts or ends between the given start or end time.
  const clashingAppointments = await AppointmentModel.find({
    counsellorId: counsellorId,
    // check to see if the counsellor has any other appointments have start or end times that occur between the desired start and end times of the new appointment.
    $or: [
      {
        $and: [
          {
            startTime: {
              $lte: desiredEndTime
            }
          },
          {
            startTime: {
              $gte: desiredStartTime
            }
          }
        ]
      },
      {
        $and: [
          {
            endTime: {
              $gte: desiredStartTime
            }
          },
          {
            endTime: {
              $lte: desiredEndTime
            }
          }
        ]
      }
    ]
  });

  // If there are any clashing appointments, return an error (the counsellor isn't free).
  if (clashingAppointments.length > 0) {
    return {
      message: "Counsellor is not available at that time.",
      code: 200
    };
  }

  // If we make it this far, the requested appointment time is valid!!
  return;
}

// This function creates a moment object on the same day as another, but with a different time.
function getMomentFromTimeString(originalMoment, time) {
  let parts = time.split(":");
  let hours = parts[0];
  let minutes = parts[1];
  let newMoment = moment(originalMoment).startOf("day");
  // edit moment, changing hours and minutes
  return newMoment.hours(hours).minutes(minutes);
}

// expose functions
module.exports = {
  insertAppointment,
  getAllAppointments,
  getAppointmentsOfUser,
  updateAppointment
};
