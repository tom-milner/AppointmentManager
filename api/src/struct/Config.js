const port = process.env.PORT || 8081;
const url = process.env.URL || "http://localhost"

module.exports = {

    port: port,
    url: url,
    apiUrl: process.env.URL ? `${url}/api` : `${url}:${port}`,
    clientUrl: process.env.URL ? `${url}` : `${ url }:8080`,
    accessTokenSecret: "mkcslc;vjnv;rajkrvn;rkj",
    refreshTokenSecret: "fdklvs;mvbgdff;dlgjfesnv,m",
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
    },
    location: {
        ipStackApiKey: "4bb65d91e492c4afc8da85c61c8ac32b"
    }
}