const UserModel = require("../../models/MongooseModels/UserModels/UserModel");


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

// delete a user account
async function deleteUser(req, res) {
  try {
    let userId = req.params.userId;

    let deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) throw ({
      message: "User not found",
      code: 400
    });

    res.status(200).send({
      message: "User deleted successfully",
      success: true,
      user: deletedUser
    })


  } catch (error) {
    let errorMessage = error.message || "Error deleting user.";
    let errorCode = error.code || 400
    ErrorController.sendError(res, errorMessage, errorCode)
  }
}

module.exports = {
  getReducedUsers,
  deleteUser
}