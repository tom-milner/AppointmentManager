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


function updateCounsellorSettings(req, res, next) {

  try {
    // Joi isn't needed - we only need to check if the object is present
    let counsellorSettings = req.body.counsellorSettings;
    if (!counsellorSettings) {
      throw ({
        message: "No settings found",
        code: 400
      });
    }

    next();
  } catch (error) {
    res.status(error.code || 400).send({
      message: error.message || "Error updating counsellor settings",
      success: false
    })
  }
}

module.exports = {
  getReducedUsers
}