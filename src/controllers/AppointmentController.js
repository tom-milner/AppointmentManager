// Import required models
const AppointmentModel = require("../models/AppointmentModel");
const UserModel = require("../models/UserModel");
const moment = require("moment");

// Fetch all appointments regardless
function getAllAppointments(req, res) {
  AppointmentModel.find({}, function (err, allAppointments) {
    if (err) {
      console.log(err);
      res.status(500).send({
        success: false,
        error: "An error has occured fetching all appointments"
      });
    } else {
      res.send(allAppointments);
    }
  });
}

// TODO: combine getFutureAppointmentsOfCounsellor and getAppointmentsOfClient


async function getFutureAppointmentsOfCounsellor(req, res) {

  // This function differs from "getAppointmentsOfUser" in that it searches for the user's Id in the counsellorId field of each appointment.
  // TODO: create policy for this function

  // default error messages
  let errorCode = 400;
  let errorMessage = "Error getting future appointments";

  // get current time
  let now = moment.now();

  try {

    const userId = req.params.userId;
    let appointmentsFromNow = await AppointmentModel.find({
      $or: [{
        counsellorId: userId
      }, ],
      // only get appointments that start or end in the future.
      $or: [{
          startTime: {
            $gt: now
          }
        },
        {
          endTime: {
            $gt: now
          }
        }
      ]
    });

    res.status(200).send({
      success: true,
      message: "Future appointments returned successfully",
      futureAppointments: appointmentsFromNow
    })

  } catch (error) {

    console.log(error);
    // return an error message
    res.status(errorCode).send({
      success: false,
      message: errorMessage
    })

  }

}

// Return appointments of user
async function getAppointmentsOfClient(req, res) {
  try {
    const userId = req.params.userId;
    // Find user with given Id
    const user = await UserModel.findOne({
      _id: userId
    });
    if (!user) throw "User not found";

    const userAppointments = await AppointmentModel.find({
      clients: userId
    });

    res.status(200).send({
      success: true,
      message: "Appointments returned successfully",
      appointments: userAppointments
    });
  } catch (errorMessage) {
    res.status(400).send({
      success: false,
      message: errorMessage || "Error getting user appointments."
    });
  }
}

// Insert new appointment into db
async function insertAppointment(req, res) {
  try {
    // load  info from body
    const appointmentStartTime = moment(req.body.startTime);
    const appointmentDuration = req.body.duration; // In Minutes
    const appointmentEndTime = moment(req.body.startTime).add(
      appointmentDuration,
      "minutes"
    );
    const counsellorId = req.body.counsellorId;
    const clientId = req.user._id;

    // check to see if counsellor is free
    await checkCounsellorAvailablity(
      appointmentStartTime,
      appointmentEndTime,
      counsellorId
    );

    // check to see if client is free
    await checkClientAvailability(
      appointmentStartTime,
      appointmentEndTime,
      clientId
    );

    // Create new appointment model
    let appointment = new AppointmentModel({
      title: req.body.title,
      startTime: appointmentStartTime,
      // TODO: add buffer to end time
      endTime: appointmentEndTime,
      clients: [req.user],
      isApproved: false,
      counsellorId: counsellorId
    });

    // Save the model to the database
    await appointment.save(function (err, newAppointment) {
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
    throw {
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
  // get all appointments of counsellor where an appointment either starts or ends between the given start or end time.
  const counsellorAppointments = await AppointmentModel.find({
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
  console.log(counsellorAppointments);
  // 0 clashes - counsellor is free
  if (counsellorAppointments.length > 0) {
    console.log("clash");
    throw {
      message: "Counsellor is not available at that time.",
      code: 200
    };
  }
}

module.exports = {
  insertAppointment,
  getAllAppointments,
  getAppointmentsOfClient,
  getFutureAppointmentsOfCounsellor
};