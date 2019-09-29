const express = require("express");
const router = express.Router();

const CounsellorController = require("../../controllers/UserControllers/CounsellorController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const UserControllerPolicy = require("../../policies/UserPolicies/UserControllerPolicy");
const Role = require("../../models/Role");


// get list of counsellors
router.get("/", CounsellorController.getAllCounsellorsReduced);

// update counsellor
router.post("/:counsellorId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor,
  useSpecific: true
}), UserControllerPolicy.updateCounsellor, CounsellorController.updateCounsellor)

// get all info about a counsellor
router.get("/full/:counsellorId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), CounsellorController.getCounsellor({
  reduced: false
}));

// get reduced info about a counsellor (wokring hours, name etc)
router.get("/:counsellorId", CounsellorController.getCounsellor({
  reduced: true
}));


module.exports = router;