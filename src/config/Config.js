module.exports = {

  port: process.env.PORT || 8081,
  url: process.env.URL || "http://localhost:8080/",
  jwtSecret: "mkcslc;vjnv;rajkrvn;rkj",
  mailer: {
    email: process.env.MAILER_EMAIL,
    apiKey: process.env.SENDGRID_API_KEY
  },
  db: {
    url: process.env.DB_URL || "localhost:27017/appointment_manager",
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  }
}