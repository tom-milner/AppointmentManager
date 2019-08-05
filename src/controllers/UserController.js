let UserModel = require("../models/UserModel");



// TODO: Build UserControllerPolicy

// takes array of client Ids an returns simple user object.
async function getUsernamesFromClientIds(req, res) {
  // clientIds is a string with comma seperated values

  let clientIds = (req.query.clientIds).split(",").filter(Boolean);
  console.log(clientIds);
  let clients = [];
  for (id of clientIds) {
    let client = await UserModel.findOne({
      _id: id
    });
    client.password = undefined;
    clients.push(client);
  }

  console.log(clients);

  res.status(200).send({
    success: true,
    message: "Clients returned successfully",
    clients: clients
  });

}

module.exports = {
  getUsernamesFromClientIds
}