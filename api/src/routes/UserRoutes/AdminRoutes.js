const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// This file contains routes to deal with admin operations.

const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const Roles = require("../../models/Roles");

// This route is only here for emergency purposes (in case I need to check the application logs and don't have access to the server that the API is running on).
// It streams the desired log file to the requesting device.
router.get(
  "/getLogs",
  AuthenticationMiddleware.isLoggedIn,
  AuthenticationMiddleware.roleCheck({
    role: Roles.ADMIN
  }),
  function(req, res) {
    let file = req.query.log;
    let logPath = "";
    let header = "";

    if (file == "err") {
      logPath = path.join(__dirname, "../../../error.log");
      header = "attachment; filename=error.log";
    } else if (file == "gen") {
      logPath = path.join(__dirname, "../../../general.log");
      header = "attachment; filename=general.log";
    } else {
      return res.end("Invalid file");
    }
    // Set content type so requesting device expects
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": header
    });
    // Stream the file to the requesting device.
    fs.createReadStream(logPath).pipe(res);
  }
);

module.exports = router;
