const CounsellorModel = require("../models/CounsellorModel");
const UserModel = require("../models/UserModel");

const Role = require("../models/Role");

// takes array of user Ids an returns simple user object.
async function getReducedUsers(req, res) {
  // userIds is a string with comma seperated values
  try {
    let userIds = (req.query.userIds).split(",").filter(Boolean);
    let users = [];
    for (id of userIds) {
      let user = await UserModel.findOne({
        _id: id
      }, "username firstname lastname");
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
    })
  }

}

// get list of all the counsellors with a the counsellor role level
async function getAllCounsellors(req, res) {

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
      }
    }

    res.status(200).send({
      success: true,
      message: "Counsellors returned successfully",
      counsellors: counsellors
    })

  } catch (error) {

    console.log(error);

    res.status(error.code || 500).send({
      success: false,
      message: error.message || "Error returning counsellors.",
    })
  }
}


// changing counsellor settings
async function updateCounsellor(req, res) {
  // TODO: create policy

  let counsellorId = req.params.counsellorId;
  let newCounsellorSettings = req.body.counsellorSettings;

  try {
    let updatedCounsellorSettings = await CounsellorModel.findByIdAndUpdate(counsellorId, newCounsellorSettings, {
      new: true,
    });

    console.log(updatedCounsellorSettings);

    if (!updatedCounsellorSettings) {
      throw ({
        message: "Counsellor doesn't exist",
        code: 400
      });
    }
    res.status(200).send({
      success: true,
      message: "Counsellor settings updated."
    })
  } catch (error) {
    res.status(error.code || 400).send({
      success: false,
      message: error.message || "Error updating counsellor settings"
    })
  }

}

async function getCounsellor(req, res) {
  let counsellorId = req.params.counsellorId;

  try {
    let counsellor = await CounsellorModel.findById(counsellorId);
    console.log(counsellor);
    if (counsellor) {
      res.status(200).send({
        message: "Counsellor returned successfully",
        success: true
      });
    }
  } catch (error) {
    res.status(400).send({
      message: "Counsellor couldn't be found",
      success: false
    });
  }

}

module.exports = {
  getReducedUsers,
  getAllCounsellors,
  updateCounsellor,
  getCounsellor
}