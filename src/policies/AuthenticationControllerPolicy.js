const Joi = require("joi");

function register(req, res, next) {

  const joiSchema = {
    username: Joi.string().min(1).max(50).required(),
    firstname: Joi.string().min(1).max(50).required(),
    lastname: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(32).required()
  }

  const {
    error,
    value
  } = Joi.validate(req.body, joiSchema);

  let errorMessage = "";
  let errorCode;

  if (error) {
    switch (error.details[0].context.key) {
      case "email":
        errorCode = 400;
        errorMessage = "You must provide a valid email address";
        break;
      case "password":
        errorMessage = `The password provided failed to match the following rules: 
                        <br>
                        1. It must contain ONLY the following characters: lower case, upper case, numerics, and punctuation.
                        <br>
                        2. It must be at least 8 characters in length and not greater than 32 characters in length.
                        `
        errorCode = 400;
        break;

      default:
        console.log(error.details)
        errorMessage: error.details[0].message
        errorCode = 400;
    }

    res.status(errorCode).send({
      success: false,
      message: errorMessage || "Error registering user."
    });
  } else {
    next();
  }
}



module.exports = {
  register
}