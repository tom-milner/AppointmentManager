// Import required models
const AppointmentModel = require("../models/AppointmentModel");
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

function getAppointmentsOfCounsellor({
  reduced
}) {

  return async function (req, res) {
    // TODO: create policy for this function
    try {
      const userId = req.params.userId;
      let appointments = await AppointmentModel.find({
        counsellorId: userId
      }).sort({
        startTime: "asc"
      });

      if (reduced) {
        // reduce appointments down to only essential info
        let reducedAppointments = [];
        appointments.forEach(appointment => {
          reducedAppointments.push({
            title: appointment.title,
            startTime: appointment.startTime,
            endTime: appointment.endTime
          });
        });
        appointments = reducedAppointments;
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
  }
}

// Return appointments of user
async function getAppointmentsOfClient(req, res) {
  // TODO: create policy for this function
  try {
    const userId = req.params.userId;

    // get all the appointments of the user, but exclude the counsellors notes
    const userAppointments = await AppointmentModel.find({
      clients: userId
    }, {
      counsellorNotes: 0
    }).sort({
      startTime: "asc"
    });

    res.status(200).send({
      success: true,
      message: "Appointments returned successfully",
      appointments: userAppointments
    });

  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error getting client appointments."
    });
  }
}

// Insert new appointment into db
async function insertAppointment(req, res) {
  console.log(req.body);
  try {
    console.log(req.body);
    // load  info from body
    const appointmentStartTime = moment(req.body.startTime);
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

    console.log(req.body);

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
    console.log(error);
    res.status(error.code || 500).send({
      message: error.message || "Error creating appointment",
      success: false
    });
  }
}

async function updateAppointment(req, res) {
  try {
    let newAppointmentProperties = req.body.appointmentProperties;
    let appointmentId = req.body.appointmentId;
    await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      newAppointmentProperties
    );
    res.status(200).send({
      success: true,
      message: "Appointment updated successfully"
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error updating appointment"
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
    return {
      message: "Counsellor is not available at that time.",
      code: 200
    };
  }
}

// expose functions
module.exports = {
  insertAppointment,
  getAllAppointments,
  getAppointmentsOfClient,
  getAppointmentsOfCounsellor,
  updateAppointment
};