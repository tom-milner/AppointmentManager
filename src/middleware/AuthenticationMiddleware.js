// import json web token library
const jwt = require("jsonwebtoken"); // used for using token based authentication

// middleware for checking user access
function isLoggedIn(req, res, next) {
  // check header for token
  var token = req.headers.authorization

  // decode token (if present)
  if (token) {
    token = token.replace("Bearer ", "");
    // validate secret
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
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
function roleCheck(role) {
  return function (req, res, next) {
    // if user is below required role / access level, return an error and deny access.
    if (req.user.role < role) {
      // deny access
      res.status(403).send({
        success: false,
        message: "Access Denied"
      });
      return;
    }
    // allow access to route
    next();
  };
}

// expose functions for usage
module.exports = {
  isLoggedIn,
  roleCheck
};