var express = require("express");
var router = express.Router();

const AuthenticationController = require("../controllers/AuthenticationController");

const AuthenticationControllerPolicy = require("../policies/AuthenticationControllerPolicy");
router.get("/status", function (req, res) {
  res.json({
    status: "OK"
  })
});


router.post("/register", AuthenticationControllerPolicy.register, AuthenticationController.register)
router.post("/login", AuthenticationController.login);

module.exports = router;