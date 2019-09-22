const CounsellorModel = require("../../models/MongooseModels/CounsellorModel");
const AppointmentTypeModel = require("../../models/MongooseModels/AppointmentTypeModel");
const Utils = require("../../utils/Utils");





// ########################################################
// Helper functions - not called directly by route handler
// ########################################################

async function validateAppointmentType(typeId) {
  let foundType = await AppointmentTypeModel.findById(typeId);
  if (!foundType) return {
    message: "Appointment type doesn't exist",
    code: 400
  };
}

async function checkClientAvailability(
  desiredStartTime,
  desiredEndTime,
  clientId
) {
  // check to see if client has any clashing appointments
  let clashingAppointments = await AppointmentModel.find({
    clients: clientId,
    // check to see if any of the clients have any other appointments have start or end times that occur between the desired start and end times of the new appointment.
    $or: [{
        $and: [{
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
        $and: [{
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
  let startOfDay = Utils.getMomentFromTimeString(
    desiredStartTime,
    validDay.startTime
  );
  let endOfDay = Utils.getMomentFromTimeString(desiredEndTime, validDay.endTime);

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

  // Now we know that the counsellor is working during the requested times, we need to check to see if the desired time clashes with any other appointments.

  // get all appointments of counsellor where an appointment either starts or ends between the given start or end time.
  const clashingAppointments = await AppointmentModel.find({
    counsellorId: counsellorId,
    // check to see if the counsellor has any other appointments have start or end times that occur between the desired start and end times of the new appointment.
    $or: [{
        $and: [{
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
        $and: [{
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

module.exports = {
  validateAppointmentType,
  checkClientAvailability,
  checkCounsellorAvailablity
}