// update an existing client
function updateClient(req, res) {
  //  validate appointment Id
  let validClientId = Utils.validateMongoId(req.params.clientId);
  if (!validClientId) {
    throw {
      message: "Invalid client Id",
      code: 400
    };
  }

  // validate client properties
  let requestedClientProperties = Object.keys(req.body.clientProperties);

  // all the possible client properties
  // let clientP Object.keys()
}

module.exports = {
  updateClient
};
