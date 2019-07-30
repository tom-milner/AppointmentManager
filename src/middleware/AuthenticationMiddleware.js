// import json web token library
const jwt = require("jsonwebtoken"); // used for using token based authentication

// middleware for checking user access
function isLoggedIn(req, res, next) {
  // check header for token
  var token = req.headers.authorization;

  // decode token (if present)
  if (token) {
    token = token.replace("Bearer ", "");
    // validate secret
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        // return error if token isn't valid
        return res.status(401).json({
          success: false,
          error: "Failed to authenticate token"
        });
      } else {
        // token is valid
        // store token in browser for later usage
        req.user = decoded;
        console.log(req.user);

        // continue to controller that requires authorization
        next();
      }
    });
  } else {
    // no token - return an error
    return res.status(403).send({
      success: false,
      error: "No authentication token provided."
    });
  }
}

// middleware check if the user is required to access the given route
function roleCheck(role, userSpecific) {
  return function(req, res, next) {
    // if user is above minimum role, allow them access
    if (req.user.role > role) {
      next();
      return;
    }
    // check if the user is the required role.
    if (req.user.role == role) {
      // check if endpoint can only be accessed by specific user.
      if (!userSpecific) {
        next();
        return;
      }

      if (req.user._id == req.params.userId) {
        next();
        return;
      }
    }

    // deny access - user does not meet any of the above criteria
    res.status(403).send({
      success: false,
      message: "Access Denied"
    });
  };
}

// expose functions for usage
module.exports = {
  isLoggedIn,
  roleCheck
};
