const Joi = require("joi");
const ErrorController = require("../controllers/ErrorController");

function updateUser({
  isGuest,
  isNew
}) {

  return function (req, res, next) {


    let joiSchema = {
      firstname: Joi.string().min(1).max(50).required(),
      lastname: Joi.string().min(1).max(50).required(),
      email: Joi.string().email().required(),
    }
    if (!isGuest) {
      if (isNew) {
        joiSchema.password = Joi.string().min(8).max(32).required();
      }
      joiSchema.username = Joi.string().min(1).max(50).required()
    }



    // Some parts of the web app use this middleware, but provide the data inside either counsellor or client objects. 
    let data = req.body;
    if (req.body.counsellorInfo) {
      data = req.body.counsellorInfo
    } else if (req.body.clientInfo) {
      data = req.body.clientInfo
    }
    const {
      error,
      value
    } = Joi.validate(data, joiSchema, {
      stripUnknown: true
    });

    // If the error is more specific these will be overwritten.
    let errorMessage = "Error registering user.";
    let errorCode = 500;

    if (error) {
      console.log(error);
      switch (error.details[0].context.key) {
        case "email":
          errorCode = 400;
          errorMessage = "You must provide a valid email address";
          break;
        case "password":
          errorMessage =
            "Password must be at least 8 characters in length and not greater than 32 characters in length."
          errorCode = 400;
          break;

        default:
          console.log(error.details)
          errorMessage = error.details[0].message
          errorCode = 400;
      }
      // return an error
      ErrorController.sendError(res, errorMessage, errorCode);
      return;

    }
    next();

  }
}

function forgotPassword(req, res, next) {
  const joiSchema = {
    email: Joi.string().email().required()
  }

  const {
    error,
  } = Joi.validate(req.body, joiSchema);

  let errorMessage, errorCode;

  if (error) {
    if (error.details[0].context.key == "email") {
      errorMessage = "Invalid email."
      errorCode = 400;
    } else {
      errorMessage = "Error sending reset email"
      errorCode = 400;
    }
    ErrorController.sendError(res, errorMessage, errorCode);
    return;
  }

  // email is fine
  next();
}

function resetPassword(req, res, next) {

  const joiSchema = {
    password: Joi.string().min(8).max(32).required(),
    token: Joi.string().hex().length(128).required()
  }

  const {
    error
  } = Joi.validate(req.body, joiSchema);

  let errorMessage, errorCode;
  if (error) {
    console.log(error);
    switch (error.details[0].context.key) {
      case "password":
        errorMessage = "Password must be between 8 and 32 characters in length";
        errorCode = 400;
        break;
      case "token":

        errorMessage = "Invalid token.";
        errorCode = 400;
        break;
      default:
        errorMessage = "Error sending reset email"
        errorCode = 400;
    }
    ErrorController.sendError(res, errorMessage, errorCode);
    return;

  }

  next();

}


module.exports = {
  updateUser,
  forgotPassword,
  resetPassword
}