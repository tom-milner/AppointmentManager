const UserModel = require("../../models/MongooseModels/UserModel");


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

    ErrorController.sendError(res, "Error getting usernames.", 400);

  }
}

module.exports = {
  getReducedUsers
}