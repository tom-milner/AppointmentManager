// This file maps the environment variables to a javascript object, and sets any defaut variables if the environment variables can't be found.

const dotenv = require("dotenv"); // Required for loading custom environment variables.
const path = require("path");


// Load in custom environment variables
const envFilePath = path.join(__dirname, "../../.env");

dotenv.config({
  path: envFilePath
});

const port = process.env.PORT || 8081;
const url = process.env.URL || "http://localhost";

module.exports = {
  PORT: port, // The port to run on. NOTE: this is the internal port for NGINX to point to.
  URL: url, // The baseURL of the app.
  API_URL: process.env.URL ? `${url}/api` : `${url}:${port}`, // The URL of the API
  CLIENT_URL: process.env.URL ? `${url}` : `${url}:8080`, // The URL of the client
  ACCESS_TOKEN_SECRET: "mkcslc;vjnv;rajkrvn;rkj", // The secret to sign the access tokens with.
  REFRESH_TOKEN_SECRET: "fdklvs;mvbgdff;dlgjfesnv,m", // The secret to sign the refresh tokens with.
  mailer: {
    EMAIL: process.env.GOOGLE_MAIL_ACCOUNT // The email account to use to send emails.
  },
  db: {
    URL: process.env.DB_URL || "mongodb://127.0.0.1:27017/appointment_manager", // The url of the database.
    USER: process.env.DB_USER, // The user to use to access the database.
    PASS: process.env.DB_PASS, // The password of the database user.
    BACKUP_LOCATION: process.env.DB_BACKUP_LOCATION || path.join(__dirname, "../../Backups/"), // The location to backup the database to.
    BACKUP_PASSWORD: process.env.DB_BACKUP_PASSWORD // The password to encrypt the database with.
  },
  googleAuth: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID, // The Google project ID.
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET, // The Google project secret.
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URL // The URL that the google API sends the access tokens to.
  },
  location: {
    IPSTACK_API_KEY: process.env.IPSTACK_API_KEY, // The API Key to use with the ipStack service
    IPSTACK_API: process.env.IPSTACK_API // The ipStack API URL.
  }
};
