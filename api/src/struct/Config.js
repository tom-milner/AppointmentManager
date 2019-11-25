const port = process.env.PORT || 8081;
const url = process.env.URL || "http://localhost"
const path = require("path");

module.exports = {

    port: port, // The port to tun on. NOTE: this is the internal port for NGINX to point to.
    url: url, // The baseURL of the app.
    apiUrl: process.env.URL ? `${url}/api` : `${url}:${port}`, // The URL of the API
    clientUrl: process.env.URL ? `${url}` : `${url}:8080`, // The URL of the client
    accessTokenSecret: "mkcslc;vjnv;rajkrvn;rkj", // The secret to sign the access tokens with.
    refreshTokenSecret: "fdklvs;mvbgdff;dlgjfesnv,m", // The secret to sign the refresh tokens with.
    mailer: {
        email: process.env.GOOGLE_MAIL_ACCOUNT, // The email account to use to send emails.
    },
    db: {
        url: process.env.DB_URL || "mongodb://127.0.0.1:27017/appointment_manager", // The url of the database.
        user: process.env.DB_USER, // The user to use to access the database.
        pass: process.env.DB_PASS, // The password of the database user.
        backupLocation: process.env.DB_BACKUP_LOCATION || path.join(__dirname, "../../Backups/"), // The location to backup the database to.
        backupPassword: process.env.DB_BACKUP_PASSWORD // The password to encrypt the database with. 
    },
    googleAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID, // The Google project ID.
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // The Google project secret.
        redirectUri: process.env.GOOGLE_REDIRECT_URL // The URL that the google API sends the access tokens to.
    },
    location: {
        ipStackApiKey: process.env.IPSTACK_API_KEY, // The API Key to use with the ipStack service
        ipStackApi: process.env.IPSTACK_API // The ipStack API URL.
    },
    monitoring: {
        sentryDSN: process.env.SENTRY_API_DSN
    }
}