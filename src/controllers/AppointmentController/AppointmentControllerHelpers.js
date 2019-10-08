const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const AppointmentTypeModel = require("../../models/MongooseModels/AppointmentTypeModel");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Utils = require("../../utils/Utils");
const MongooseObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");

// ########################################################
// Helper functions - not called directly by route handler
// ########################################################

async function createAndCheckAllAppointments(appointmentInfo, appointmentType) {

  let readyAppointments = [];

  if (appointmentType.isRecurring) {
    // give the recurring series of appointments an ID so that they can be found together easily.
    let recurringSeriesId = new MongooseObjectId();
    appointmentInfo.recurringSeriesId = recurringSeriesId;

    // create the recurrring appointments
    let appointments = [];
    appointments.push(appointmentInfo);

    let originalStart = appointmentInfo.startTime.clone();
    let originalEnd = appointmentInfo.endTime.clone();

    // add the recurring appointments
    for (
      let index = 1; index < appointmentInfo.appointmentType.recurringDuration; index++
    ) {
      let newStart = originalStart.add(1, "week");
      let newEnd = originalEnd.add(1, "week");

      const newAppointment = Object.assign({}, appointmentInfo);
      newAppointment.startTime = moment(newStart);
      newAppointment.endTime = moment(newEnd);
      newAppointment.recurringNo = index;
      // add appointment
      appointments[index] = newAppointment;
    }


    // check that the counsellor and client can make all the appointments.
    for (let appointment of appointments) {
      let error = await checkAllAvailability(
        appointment.startTime,
        appointment.endTime,
        appointment.clientId,
        appointment.counsellorId
      );
      if (error) {
        console.log(error.clashInfo);

        throw {
          message: error.message,
          code: error.code,
          clashInfo: error.clashInfo
        };
      }
    }

    // all appointments are free, so book them;
    readyAppointments = appointments;
  } else {
    // create single appointment
    readyAppointments.push(
      appointmentInfo
    );
  }

  // return ready appointments.
  return readyAppointments;
}

async function insertAppointment(appointmentInfo) {
  console.log(appointmentInfo.appointmentType);

  // Create new appointment model
  let appointment = new AppointmentModel({
    title: appointmentInfo.title,
    startTime: appointmentInfo.startTime,
    // TODO: add buffer to end time
    endTime: appointmentInfo.endTime,
    appointmentType: appointmentInfo.appointmentType,
    // This is an array as I plan on adding support for multiple clients. This is an extension objective.
    clients: [appointmentInfo.clientId],
    isApproved: false,
    counsellorId: appointmentInfo.counsellorId,
    clientNotes: appointmentInfo.clientNotes,
    counsellorNotes: appointmentInfo.counsellorNotes,
    recurringSeriesId: appointmentInfo.recurringSeriesId,
    recurringNo: appointmentInfo.recurringNo
  });

  // Save the model to the database
  let createdAppointment = await appointment.save();
  return createdAppointment;

}

async function getAppointmentType(typeId) {
  let foundType = await AppointmentTypeModel.findById(typeId);
  if (!foundType) return;
  return foundType;
}

async function checkAllAvailability(
  desiredStartTime,
  desiredEndTime,
  clientId,
  counsellorId
) {
  // check client
  let clientError = await checkClientAvailability(
    desiredStartTime,
    desiredEndTime,
    clientId
  );
  if (clientError) return clientError;

  // check counsellor
  let counsellorError = await checkCounsellorAvailablity(
    desiredStartTime,
    desiredEndTime,
    counsellorId
  );
  if (counsellorError) return counsellorError;
}

async function checkClientAvailability(
  desiredStartTime,
  desiredEndTime,
  clientId
) {
  // first make sure the client exists
  let validClient = await UserModel.findById(clientId);
  if (!validClient) {
    return {
      message: "Client doesn't exist",
      code: 400
    };
  }

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
    let clashInfo = createClashInfo(clashingAppointments);
    return {
      message: "Client is not available at this time.",
      clashInfo: clashInfo,
      code: 200,
    };
  }
}

async function checkCounsellorAvailablity(
  desiredStartTime,
  desiredEndTime,
  counsellorId
) {
  // First check to see if counsellor exists.
  const counsellor = await CounsellorModel.findById(counsellorId); // Get the counsellor from the database.
  if (!counsellor) {
    return {
      message: "Counsellor doesn't exist",
      code: 400
    };
  }

  // now check to see if the counsellor if available to work at the desired time.
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
  let endOfDay = Utils.getMomentFromTimeString(
    desiredEndTime,
    validDay.endTime
  );

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
    let clashInfo = createClashInfo(clashingAppointments);
    return {
      message: "Appointments Clash.",
      code: 200,
      clashInfo: clashInfo

    };
  }

  // If we make it this far, the requested appointment time is valid!!
  return;
}


function createClashInfo(clashingAppointments) {
  let clashInfo = [];
  for (let appointment of clashingAppointments) {
    if (appointment.appointmentType.isRecurring) {
      clashInfo.push({
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        noFutureAppointments: appointment.appointmentType.recurringDuration - appointment.recurringNo
      });
    }
  }
  return clashInfo;
}

module.exports = {
  getAppointmentType,
  checkAllAvailability,
  insertAppointment,
  createAndCheckAllAppointments
};