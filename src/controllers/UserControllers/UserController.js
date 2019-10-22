const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const AppResponse = require("../../struct/AppResponse");

// takes array of user Ids an returns simple user object.
async function getReducedUsers(req, res) {

  const response = new AppResponse(res);
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
    return response.success("Users returned successfully", {
      users: users
    });

  } catch (error) {
    return response.failure("Error getting usernames.", 400);
  }
}

// delete a user account
async function deleteUser(req, res) {
  const repsonse = new AppResponse(res);
  try {
    let userId = req.params.userId;

    let deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) throw ({
      message: "User not found",
      code: 400
    });

    return response.success("User deleted successfully", {
      user: deletedUser
    })


  } catch (error) {
    let errorMessage = error.message || "Error deleting user.";
    let errorCode = error.code || 400
    return response.failure(errorMessage, errorCode)
  }
}

module.exports = {
  getReducedUsers,
  deleteUser
}