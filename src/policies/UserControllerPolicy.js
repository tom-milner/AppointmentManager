const Joi = require("joi");

function getReducedUsers(req, res, next) {
  const joiSchema = {
    userIds: Joi.string().required(),
  }

  const {
    error,
    value
  } = Joi.validate(req.query, joiSchema);

  let errorMessage = "";
  let errorCode = 400;

  if (error) {
    switch (error.details[0].context.key) {
      case "userIds":
        errorMessage = "Invalid user Ids";
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
  getReducedUsers
}