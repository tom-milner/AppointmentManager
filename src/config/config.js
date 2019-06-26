module.exports = {

  port: process.env.PORT || 8081,
  mongo_url: process.env.DB_URL || "localhost:27017/appointment_manager",
  jwt_secret: "mkcslc;vjnv;rajkrvn;rkj"

  //PORT=8081
  // DB_URL = "mongodb://localhost:27017/appointment_manager"
  // DB_USER = ""
  // DB_PASS = ""
  // JWT_SECRET = "mkcslc;vjnv;rajkrvn;rkj"


}