const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const ErrorController = require("../../controllers/ErrorController");
const Utils = require("../../utils/Utils");

// get all the clients
async function getClients(req, res) {
  // return all the clients.
  // TODO: implement limits
  const limit = parseInt(req.query.limit);

  let clientQuery = ClientModel.find({}).select("username firstname lastname email");

  if (limit) clientQuery.limit(limit);


  try {
    let allClients = await clientQuery.exec();
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
function getClient({
  reduced
}) {

  return async function (req, res) {
    let clientId = req.params.clientId;

    try {

      // find matching client;
      let client = await ClientModel.findById(clientId).select("+clinicalNotes");
      if (reduced) client = {
        firstname: client.firstname,
        lastname: client.lastname,
        _id: client._id,
      }

      res.status(200).send({
        success: true,
        message: "Client returned successfully",
        client: client,
      });

    } catch (error) {
      ErrorController.sendError(res, "Client couldn't be found.", 404);
    }
  }

}

// update an existing client
async function updateClient(req, res) {
  let clientId = req.params.clientId;
  let newClientInfo = req.body.clientInfo;

  try {
    let updatedClient = await ClientModel.findByIdAndUpdate(clientId,
      newClientInfo, {
        new: true,
        runValidators: true
      });

    if (!updatedClient) throw {
      message: "Client doesn't exist",
      code: 404
    }
    res.status(200).send({
      success: true,
      message: "Client updated",
      updatedClient: updatedClient
    })

  } catch (error) {
    ErrorController.send(res, error.message || "Error updating client", error.code || 400);
  }
}



module.exports = {
  getClients,
  getClient,
  updateClient
}