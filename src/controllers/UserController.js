const CounsellorModel = require("../models/MongooseModels/CounsellorModel");
const UserModel = require("../models/MongooseModels/UserModel");


// takes array of user Ids an returns simple user object.
async function getReducedUsers(req, res) {
  // userIds is a string with comma seperated values
  try {
    let userIds = req.query.userIds.split(",").filter(Boolean);
    let users = [];
    for (id of userIds) {
      let user = await UserModel.findOne({
          _id: id
        },
        "username firstname lastname"
      );
      if (user) users.push(user);
    }
    res.status(200).send({
      success: true,
      message: "Users returned successfully",
      users: users
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error getting usernames."
    });
  }
}

// get list of all the counsellors 
async function getAllCounsellorsReduced(req, res) {
  try {
    // get all the counsellors but exclude their personal information.
    let counsellors = await CounsellorModel.find({}, {
      password: 0,
      email: 0,
      type: 0
    });
    // make sure counsellors could be found
    if (counsellors.length === 0) {
      throw {
        message: "No counsellors could be found.",
        code: 400
      };
    }

    res.status(200).send({
      success: true,
      message: "Counsellors returned successfully",
      counsellors: counsellors
    });
  } catch (error) {
    console.log(error);

    res.status(error.code || 500).send({
      success: false,
      message: error.message || "Error returning counsellors."
    });
  }
}

// changing counsellor settings
async function updateCounsellor(req, res) {
  // TODO: create policy

  let counsellorId = req.params.counsellorId;
  let newCounsellorSettings = req.body.counsellorSettings;
  try {
    let updatedCounsellorSettings = await CounsellorModel.findByIdAndUpdate(
      counsellorId,
      newCounsellorSettings, {
        new: true
      }
    );

    if (!updatedCounsellorSettings) {
      throw {
        message: "Counsellor doesn't exist",
        code: 400
      };
    }
    res.status(200).send({
      success: true,
      message: "Counsellor settings updated."
    });
  } catch (error) {
    res.status(error.code || 400).send({
      success: false,
      message: error.message || "Error updating counsellor settings"
    });
  }
}

function getCounsellor({
  reduced
}) {

  return async function (req, res) {
    let counsellorId = req.params.counsellorId;

    let counsellorQuery = CounsellorModel.findOne();

    counsellorQuery.where("_id", counsellorId);

    counsellorQuery.select("-password -type"); // everything but the counsellor's password.

    try {
      // get the counsellor.
      let counsellor = await counsellorQuery.exec();
      console.log(counsellor);

      // If we need to return a reduced object, recreate the counsellor object with the required data. 
      if (reduced) counsellor = {
        firstname: counsellor.firstname,
        lastname: counsellor.lastname,
        _id: counsellor._id,
        workingDays: counsellor.workingDays
      };

      res.status(200).send({
        message: "Counsellor returned successfully",
        success: true,
        counsellor: counsellor,
      });
    } catch (error) {

      console.log(error);
      res.status(400).send({
        message: "Counsellor couldn't be found",
        success: false
      });
    }
  }
}

module.exports = {
  getReducedUsers,
  getAllCounsellorsReduced,
  updateCounsellor,
  getCounsellor
}