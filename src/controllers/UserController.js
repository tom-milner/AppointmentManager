let UserModel = require("../models/UserModel");



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

module.exports = {
  getUsernamesFromUserIds
}