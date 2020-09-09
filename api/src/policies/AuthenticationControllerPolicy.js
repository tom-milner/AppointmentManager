// This file contains policies for the authentication controller.

const Joi = require("joi");
const AppResponse = require("../struct/AppResponse");

/**
 * This function validates data supplied to the update user route.
 * @param {{}} isGuest - Whether the user being updated is a guest or not.
 * @param {{}} isNew - Whether the user is new or not.
 */
function updateUser({ isGuest, isNew }) {
  // Return a function to use as a route handler.
  return function(req, res, next) {
    const response = new AppResponse(res);

    // The minimum joi schema. This will be built upon.
    let joiSchema = {
      // Firstname must not contain any numbers
      firstname: Joi.string().regex(/[0-9]/, {
        invert: true
      }),
      // Lastname must not contain any number.
      lastname: Joi.string().regex(/[0-9]/, {
        invert: true
      }),
      email: Joi.string().email()
    };
    // If the user isn't a guest, validate their username.
    if (!isGuest) {
      // Only validate the password if the user is new (existing users can't update their password through this route);
      if (isNew) {
        joiSchema.password = Joi.string()
          .min(8)
          .max(32);
      }
      joiSchema.username = Joi.string()
        .min(1)
        .max(50);
    }

    // If this is new user, make every field in the joiSchema required.
    if (isNew) {
      for (let key of Object.keys(joiSchema)) {
        joiSchema[key] = joiSchema[key].required();
      }
    }

    // Some parts of the web app use this middleware, but provide the data inside either counsellor or client objects.
    let data = req.body;
    if (req.body.counsellorInfo) {
      data = req.body.counsellorInfo;
    } else if (req.body.clientInfo) {
      data = req.body.clientInfo;
    }
    const { error } = Joi.validate(data, joiSchema, {
      stripUnknown: true
    });

    // If the error is more specific these will be overwritten.
    let errorMessage = "";
    let errorCode = 400;

    if (error) {
      switch (error.details[0].context.key) {
        case "password":
          errorMessage =
            "Password must be at least 8 characters in length and not greater than 32 characters in length.";

          break;
        case "firstname":
        case "lastname":
          const errorDetails = error.details[0];
          // If the error was thrown by regex...
          if (errorDetails.type == "string.regex.invert.base") {
            errorMessage = "Names cannot contain numbers.";
          } else {
            errorMessage = `Invalid ${errorDetails.path[0]}.`;
          }

          break;
        default:
          errorMessage = `Invalid ${error.details[0].context.key}`;
      }
      // return an error
      return response.failure(errorMessage, errorCode);
    }
    next();
  };
}

/**
 * This function validates data supplied to the forgot password function.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function to be called in the middleware chain.
 */
function forgotPassword(req, res, next) {
  const response = new AppResponse(res);

  const joiSchema = {
    email: Joi.string()
      .email()
      .required()
  };

  const { error } = Joi.validate(req.body, joiSchema);

  let errorMessage, errorCode;

  if (error) {
    if (error.details[0].context.key == "email") {
      errorMessage = "Invalid email.";
      errorCode = 400;
    } else {
      errorMessage = "Error sending reset email";
      errorCode = 400;
    }
    response.failure(errorMessage, errorCode);
    return;
  }

  // email is fine
  next();
}

/**
 * This function validates data supplied to the reset password function.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function to be called in the middleware chain.
 */
function resetPassword(req, res, next) {
  const response = new AppResponse(res);

  const joiSchema = {
    password: Joi.string()
      .min(8)
      .max(32)
      .required(),
    token: Joi.string()
      .hex() // token must be in hexadecimal format (0-9, A-F)
      .length(128) // token must be 128 characters
      .required()
  };

  const { error } = Joi.validate(req.body, joiSchema);

  let errorMessage, errorCode;
  if (error) {
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
        errorMessage = "Error sending reset email";
        errorCode = 400;
    }
    return response.failure(errorMessage, errorCode);
  }
  next();
}

module.exports = {
  updateUser,
  forgotPassword,
  resetPassword
};
