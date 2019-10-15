const express = require("express");
const router = express.Router();

const CounsellorController = require("../../controllers/UserControllers/CounsellorController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const Role = require("../../models/Role");
const CounsellorControllerPolicy = require("../../policies/UserPolicies/CounsellorControllerPolicy");
const AuthenticationControllerPolicy = require("../../policies/AuthenticationControllerPolicy");

// get list of counsellors
router.get("/", CounsellorController.getAllCounsellorsReduced);


// update counsellor
router.post(
  "/:counsellorId",
  AuthenticationMiddleware.isLoggedIn,
  AuthenticationMiddleware.roleCheck({
    role: Role.Counsellor,
    useSpecific: true
  }),
  AuthenticationControllerPolicy.updateUser({
    isGuest: false,
    isNew: false
  }),
  CounsellorControllerPolicy.updateCounsellor,
  CounsellorController.updateCounsellor
);

// get all info about a counsellor
router.get(
  "/full/:counsellorId",
  AuthenticationMiddleware.isLoggedIn,
  AuthenticationMiddleware.roleCheck({
    role: Role.Counsellor
  }),
  CounsellorController.getCounsellor({
    reduced: false
  })
);

// get reduced info about a counsellor (wokring hours, name etc)
router.get(
  "/:counsellorId",
  CounsellorController.getCounsellor({
    reduced: true
  })
);

module.exports = router;