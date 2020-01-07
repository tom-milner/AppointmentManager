const express = require("express");
const router = express.Router();

const CounsellorController = require("../../controllers/UserControllers/CounsellorController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const Roles = require("../../models/Roles");
const CounsellorControllerPolicy = require("../../policies/UserPolicies/CounsellorControllerPolicy");
const AuthenticationControllerPolicy = require("../../policies/AuthenticationControllerPolicy");

// get list of counsellors
router.get("/", CounsellorController.getAllCounsellorsReduced);

// send an email to an existing user allowing them to upgrade their account status.
router.post("/send-email",
    AuthenticationMiddleware.isLoggedIn,
    AuthenticationMiddleware.roleCheck({
        role: Roles.COUNSELLOR
    }),
    CounsellorController.sendNewCounsellorEmail
);

// update counsellor
router.post(
    "/:counsellorId",
    AuthenticationMiddleware.isLoggedIn,
    AuthenticationMiddleware.roleCheck({
        role: Roles.COUNSELLOR,
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
        role: Roles.COUNSELLOR
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