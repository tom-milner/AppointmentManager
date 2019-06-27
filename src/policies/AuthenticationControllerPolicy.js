const Joi = require("joi");

function register(req, res, next) {

  const joiSchema = {
    username: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().regex(
      new RegExp("^[a-zA-Z0-9]{5,32}$")
    ).required()
  }

  const {
    error,
    value
  } = Joi.validate(req.body, joiSchema);


  if (error) {
    switch (error.details[0].context.key) {
      case "email":
        res.status(400).send({
          error: "You must provide a valid email address"
        });
        break;
      case "password":
        res.status(400).send({
          error: `The password provided failed to match the following rules: 
                        <br>
                        1. It must contain ONLY the following characters: lower case, upper case, numerics.
                        <br>
                        2. It must be at least 8 characters in length and not greater than 32 characters in length.
                        `
        });
        break;

      default:
        console.log(error.details[0].message)
        res.status(400).send({
          error: "Invalid information"
        });
    }
  } else {
    next();
  }
}



module.exports = {
  register
}