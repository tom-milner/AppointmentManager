module.exports = {

    port: process.env.PORT || 8081,
    url: process.env.URL || "http://localhost:8080",
    jwtSecret: "mkcslc;vjnv;rajkrvn;rkj",
    mailer: {
        email: process.env.GOOGLE_MAIL_ACCOUNT,
    },
    db: {
        url: process.env.DB_URL || "mongodb://127.0.0.1:27017/appointment_manager",
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        backupLocation: process.env.DB_BACKUP_LOCATION,
        backupPassword: process.env.DB_BACKUP_PASSWORD
    },
    googleAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URL
    }
}