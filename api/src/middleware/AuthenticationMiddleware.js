// import json web token library
const jwt = require("jsonwebtoken"); // used for using token based authentication
const AppResponse = require("../struct/AppResponse");
const Config = require("../struct/Config");

// middleware for checking user access
function isLoggedIn(req, res, next) {
    const response = new AppResponse(res);
    // check header for token
    var token = req.headers.authorization;
    // decode token (if present)
    if (token) {
        token = token.replace("Bearer ", "");
        // validate secret
        // The jsonwebtoken library doesn't support promises yet.
        jwt.verify(token, Config.accessTokenSecret, function (err, decoded) {
            if (err) {
                // return error if token isn't valid
                return response.failure("Failed to authenticate token", 401);
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
        return response.failure("No authentication token provided", 401);
    }
}

// middleware check if the user is required to access the given route
function roleCheck({
    role,
    userSpecific
}) {
    return function (req, res, next) {

        const response = new AppResponse(res);

        if (userSpecific) {
            // check if endpoint can only be accessed by specific user.
            let requestedId = req.params.userId || req.params.counsellorId || req.params.clientId;
            if (req.user._id == requestedId) {
                next();
                return;
            }
        }

        // if user is above minimum role, allow them access
        // even if the route is user-specific users with high level access can read them.
        if (req.user.role >= role) {
            next();
            return;
        } else if (req.user.role < role) {
            return response.failure("Access Denied", 403);
        }


        // deny access - user does not meet any of the above criteria
        return response.failure("Access Denied", 403);
    };
}


// expose functions for usage
module.exports = {
    isLoggedIn,
    roleCheck
};