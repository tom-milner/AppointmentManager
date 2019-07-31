var express = require("express");
var router = express.Router();

const AuthenticationController = require("../controllers/AuthenticationController");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");


const AuthenticationControllerPolicy = require("../policies/AuthenticationControllerPolicy");

router.post("/register", AuthenticationControllerPolicy.register, AuthenticationController.register)
router.post("/login", AuthenticationController.login);

router.get("/token", AuthenticationMiddleware.isLoggedIn, AuthenticationController.refreshToken);

module.exports = router;