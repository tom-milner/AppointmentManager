const CounsellorModel = require("../models/CounsellorModel");
const UserModel = require("../models/UserModel");

const Role = require("../models/Role");

// takes array of user Ids an returns simple user object.
async function getUsernamesFromUserIds(req, res) {
  // userIds is a string with comma seperated values
  try {
    let userIds = (req.query.userIds).split(",").filter(Boolean);
    let users = [];
    for (id of userIds) {
      let user = await UserModel.findOne({
        _id: id
      }, {
        password: 0
      });
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
      email: 0
    });

    // make sure counsellors could be found
    if (!counsellors) {
      throw {
        message: "No counsellors could be found.",
        code: 404
      }
    }

    res.status(200).send({
      success: true,
      message: "Counsellors returned successfully",
      counsellors: counsellors
    })

  } catch (error) {
    res.status(error.code || 500).send({
      success: false,
      message: error.message || "Error returning counsellors.",
    })
  }
}


// changing counsellor settings
module.exports = {
  getUsernamesFromUserIds,
  getAllCounsellors,
}