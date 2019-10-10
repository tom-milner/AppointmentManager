'use strict';

const {
  google
} = require("googleapis");
const http = require("http");
const destroyer = require('server-destroy');
const url = require('url');
const Config = require("../Config");
const fs = require('fs');
const path = require("path");


class GoogleAuth {

  // create singleton
  constructor() {
    // setup nodemailer
    if (!!GoogleAuth.instance) {
      return GoogleAuth.instance;
    }
    GoogleAuth.instance = this;
    this.oauth2Client = {};
    return this;
  }

  async init() {

    console.log("- Setting up google APIs...")
    let {
      clientId,
      clientSecret,
      redirectUri
    } = Config.googleAuth;


    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );


    // the APIs we will need to access
    const scope = "http://mail.google.com";

    let tokenFilePath = path.resolve(__dirname, "googleTokens.json");
    let fileExists = fs.existsSync(tokenFilePath);
    let tokens = {};

    try {
      // check to see if the application already has a google api token.
      let readFile = fs.readFileSync(tokenFilePath);
      tokens = JSON.parse(readFile);
    } catch (error) {
      console.log("! No google tokens found.")
      switch (error.code) {
        default:
          // the file must be corrupt - delete it.
          fs.unlinkSync(tokenFilePath);
          // no break here so that we create a new token file

        case "ENOENT": // skip straight to creating the new file if doesn't exist
          // create new tokens
          tokens = await this.authenticate(scope);
          // save new tokens to file
          fs.writeFileSync(tokenFilePath, JSON.stringify(tokens));
          break;

      }


    }

    console.log("✓ Google tokens found.")
    this.oauth2Client.credentials = tokens;

  }


  async authenticate(scope) {
    return new Promise((resolve, reject) => {

      // generate a url that will produce a code that can be used to generate refresh and access tokens.
      // The url will lead to a google sign in page, requiring the user to authentication the application with their chosen email account.
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: "http://mail.google.com"
      });

      // create a temporary webserver that the user will be directed to once they have authenticated the app.
      // The user redirect will contain the code that is needed to generate the refresh and access tokens.
      const tempServer = http.createServer(async (req, res) => {
        try {
          console.log(req.url);
          if (req.url.indexOf("/oauth2") > -1) {
            const searchParams = new url.URL(req.url, "http://localhost:3000").searchParams;
            res.end("Authentication Successfull.")
            tempServer.destroy();
            const {
              tokens
            } = await this.oauth2Client.getToken(searchParams.get("code"));
            resolve(tokens);
          }
        } catch (error) {
          console.log("Google Initialization unsuccessfull. Aborting.")
          reject(error);
        }
      });
      tempServer.listen(3030, () => {
        console.log("\nPaste this URL into your browser and follow the instructions to fix: \n")
        console.log(authUrl);
      });
      // destroy server so that it won't interfere with the application server.
      destroyer(tempServer);
    });
  }
}

module.exports = GoogleAuth;