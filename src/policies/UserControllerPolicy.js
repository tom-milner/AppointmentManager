const Joi = require("joi");

function getUsersOfIds(req, res, next) {
  const joiSchema = {
    clientIds: Joi.string().required(),
  }

  const {
    error,
    value
  } = Joi.validate(req.query, joiSchema);

  let errorMessage = "";
  let errorCode = 400;

  if (error) {
    switch (error.details[0].context.key) {
      case "clientIds":
        errorMessage = "Invalid client Ids";
        break;
      default:
        errorMessage = error.details[0].message;
        break;
    }

    res.status(errorCode).send({
      success: false,
      message: errorMessage,
    });

  } else {
    next();
  }
}

module.exports = {
  getUsersOfIds
}