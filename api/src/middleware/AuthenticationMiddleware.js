const jwt = require("jsonwebtoken"); // used for using token based authentication
const AppResponse = require("../struct/AppResponse");
const Config = require("../struct/Config");


/**
 * This function is middleware that checks whether a user is logged in or not.
 * Being "logged in" is defined as "having a valid access token".
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function specified in the middleware chain.
 */
function isLoggedIn(req, res, next) {
    const response = new AppResponse(res);
    // Check header for token
    let token = req.headers.authorization;

    // Decode token (if present)
    if (token) {
        // All tokens
        token = token.replace("Bearer ", "");
        // Validate secret
        jwt.verify(token, Config.ACCESS_TOKEN_SECRET, function (err, decoded) {
            // Return error if token isn't valid
            if (err) return response.failure("Failed to authenticate token", 401);

            // Token is valid - attach the user object to the request so it can be used later on.
            req.user = decoded;

            return next();

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

        // Check that 
        if (userSpecific && req.user.role == role) {
            // check if endpoint can only be accessed by specific user.
            let requestedId = req.params.userId || req.params.counsellorId || req.params.clientId;
            if (req.user._id == requestedId) {
                return next();
            } else {
                return response.failure("Access Denied", 403)
            }
        }

        // if user is above minimum role, allow them access
        // even if the route is user-specific users with high level access can read them.
        if (req.user.role >= role) {
            return next();
        } else {
            return response.failure("Access Denied", 403);
        }
    };
}


// expose functions for usage
module.exports = {
    isLoggedIn,
    roleCheck
};