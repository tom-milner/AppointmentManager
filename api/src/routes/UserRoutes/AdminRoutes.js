const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const Role = require("../../models/Role");

router.get("/getLogs", AuthenticationMiddleware.isLoggedIn, AuthenticationMiddleware.roleCheck({
    role: Role.Admin
}), function (
    req,
    res) {


    let file = req.query.log;
    let logPath = "";
    let header = "";
    if (file == "err") {
        logPath = path.join(__dirname, "../../../error.log")
        header = "attachment; filename=error.log";
    } else if (file == "gen") {
        logPath = path.join(__dirname, "../../../general.log")
        header = "attachment; filename=general.log";
    } else {
        return res.end("Invalid file");
    }

    res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": header
    });
    fs.createReadStream(logPath).pipe(res);

});


module.exports = router;