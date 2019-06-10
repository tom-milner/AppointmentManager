const jwt = require("jsonwebtoken");
const Role = require("../models/Role");

// middleware for checking user access
function isLoggedIn(req, res, next) {
  // check header for token
  var token = req.headers['authorization'];

  // decode token
  if (token) {
    token = token.replace("Bearer ", "");
    // verify secret 
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {

      if (err) {
        return res.json({
          success: false,
          error: "Failed to authenticate token",
        });
      } else {

        // verified
        req.user = decoded;
        next();

      }
    });
  } else {
    // no token - return an error
    return res.status(403).send({
      success: false,
      error: 'No authentication token provided.'
    });
  }
}


function roleCheck(role) {

  return function (req, res, next) {

    if (req.user.role < role) {
      res.status(403).send({
        success: false,
        message: "Access Denied"
      });
      return;
    }
    next();
  }

  next();

}



module.exports = {
  isLoggedIn,
  roleCheck
}