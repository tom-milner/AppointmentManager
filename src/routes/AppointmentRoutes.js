var express = require("express");
var router = express.Router();

router.get("/status", function (req, res) {
  res.json({
    status: "OK"
  })
});


module.exports = router;