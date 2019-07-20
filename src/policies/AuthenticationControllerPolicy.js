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


  if (error) {
    switch (error.details[0].context.key) {
      case "email":
        res.status(400).send({
          success: false,
          message: "You must provide a valid email address"
        });
        break;
      case "password":
        res.status(400).send({
          success: false,
          message: `The password provided failed to match the following rules: 
                        <br>
                        1. It must contain ONLY the following characters: lower case, upper case, numerics, and punctuation.
                        <br>
                        2. It must be at least 8 characters in length and not greater than 32 characters in length.
                        `
        });
        break;

      default:
        console.log(error.details)
        res.status(400).send({
          success: false,
          message: error.details[0].message
        });
    }
  } else {
    next();
  }
}



module.exports = {
  register
}