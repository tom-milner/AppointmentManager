const UserModel = require("../models/UserModel");
const Role = require("../models/Role");

// takes array of client Ids an returns simple user object.
async function getUsernamesFromUserIds(req, res) {
  // clientIds is a string with comma seperated values
  try {
    let userIds = (req.query.userIds).split(",").filter(Boolean);
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
    let counsellors = await UserModel.find({
      role: Role.Counsellor
    });

    // make sure counsellors could be found
    if (!counsellors) {
      throw {
        message: "No counsellors could be found.",
        code: 404
      }
    }

    // exclude unnecessary info.
    counsellors.forEach(counsellor => {
      counsellor.password = counsellor.email = undefined;
    });

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

module.exports = {
  getUsernamesFromUserIds,
  getAllCounsellors
}