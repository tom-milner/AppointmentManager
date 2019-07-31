const Joi = require("joi");


function insertAppointment(req, res, next) {

  const joiSchema = {
    startTime: Joi.date().required(),
    title: Joi.string().required(),
    duration: Joi.required(),
    counsellorId: Joi.string().required()
  }

  const {
    error,
    value
  } = Joi.validate(req.body, joiSchema);

  let errorMessage = "";
  let errorCode = 400;


  if (error) {
    switch (error.details[0].context.key) {
      case "startTime":
        errorMessage = "Invalid start time"
        errorCode = 400;
        break;
      case "title":
        errorMessage = "Invalid title."
        break;
      case "duration":
        errorMessage = "Invalid duration";
        break;
      case "counsellorId":
        errorMessage = "Invalid counsellorId";
        break;
      default:
        errorMessage = "Error creating appointment";
        break;
    }

    res.status(errorCode).send({
      message: errorMessage,
      success: false,
    })
  } else {
    next();
  }

}


module.exports = {
  insertAppointment
}