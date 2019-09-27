const ClientModel = require("../../models/MongooseModels/ClientModel");
const ErrorController = require("../../controllers/ErrorController");

// get all the clients
async function getAllClients(req, res) {
  // return all the clients.
  // TODO: implement limits

  try {
    let allClients = await ClientModel.find({}, "-password");
    res.status(200).send({
      success: true,
      message: "Clients returned successfully.",
      clients: allClients
    })
  } catch (error) {
    ErrorController.sendError(res, "Error finding clients.", 500);
  }
}

// get information about a single client.
function getClient(reduced) {

  return function (req, res) {
    try {
      let clientId = req.params.clientId;
      // find matching client;
      let clientQuery = ClientModel.findOne().where("_id", clientId);


    } catch (error) {

    }
  }

}


module.exports = {
  getAllClients,
  getClient
}