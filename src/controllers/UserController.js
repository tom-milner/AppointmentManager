let UserModel = require("../models/UserModel");
let AppointmentModel = require("../models/AppointmentModel");
const moment = require("moment");

// TODO: Build UserControllerPolicy

// takes array of client Ids an returns simple user object.
async function getUsernamesFromUserIds(req, res) {
  // clientIds is a string with comma seperated values

  let userIds = (req.query.userIds).split(",").filter(Boolean);
  console.log(userIds);
  let users = [];
  for (id of userIds) {
    let user = await UserModel.findOne({
      _id: id
    });
    if (user) {
      user.password = undefined;
      users.push(user);
    }
  }


  res.status(200).send({
    success: true,
    message: "Users returned successfully",
    users: users
  });

}

async function getFutureAppointmentsOfUser(req, res) {

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
      }, {
        clients: userId
      }],
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

module.exports = {
  getUsernamesFromUserIds,
  getFutureAppointmentsOfUser
}