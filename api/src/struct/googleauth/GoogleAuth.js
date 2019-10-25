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
const Logger = require("../Logger")(module);


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


    // get the client Id
    get clientId() {
        return this.oauth2Client._clientId;
    }

    get clientSecret() {
        return this.oauth2Client._clientSecret
    }

    get refreshToken() {
        return this.oauth2Client.credentials.refresh_token
    }

    get accessToken() {
        return this.oauth2Client.credentials.access_token
    }

    async init() {

        Logger.info("Setting up google APIs...")
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

        const tokenFileName = "googleTokens.json";
        let tokenFilePath = path.resolve(__dirname, tokenFileName);
        let tokens = {};

        try {
            // check to see if the application already has a google api token.
            let readFile = fs.readFileSync(tokenFilePath);
            tokens = JSON.parse(readFile);
        } catch (error) {
            switch (error.code) {
                default:
                    Logger.error(`${tokenFileName} is corrupt or doesn't exist. Deleting...`)
                    // the file must be corrupt - delete it.
                    fs.unlinkSync(tokenFilePath);
                    // no break here so that we create a new token file

                case "ENOENT": // skip straight to creating the new file if it doesn't exist
                    Logger.warn("No google tokens found.")

                    // create new tokens
                    tokens = await this.authenticate("http://mail.google.com");
                    // save new tokens to file
                    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens));
                    break;

            }


        }

        Logger.info("Google tokens found.")
        this.oauth2Client.credentials = tokens;
    }


    authenticate(scope) {
        return new Promise((resolve, reject) => {

            // generate a url that will produce a code that can be used to generate refresh and access tokens.
            // The url will lead to a google sign in page, requiring the user to authentication the application with their chosen email account.
            const authUrl = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scope
            });

            // create a temporary webserver that the user will be directed to once they have authenticated the app.
            // The user redirect will contain the code that is needed to generate the refresh and access tokens.
            const tempServer = http.createServer(async (req, res) => {
                try {
                    if (req.url.indexOf("/oauth2") > -1) {
                        // get code from url
                        const code = new url.URL(req.url, "http://localhost:3000").searchParams
                            .get("code");
                        Logger.info(`Received code.`);

                        // send success message to webpage
                        res.end("Authentication Successfull.")
                        // destroy the temporary server.
                        tempServer.destroy();

                        // generate new tokens.
                        const {
                            tokens
                        } = await this.oauth2Client.getToken(code);

                        resolve(tokens);
                    }
                } catch (error) {
                    Logger.error("Error authenticating gmail account", error);
                    reject(error);
                }
            });
            tempServer.listen(3030, () => {
                Logger.warn(
                    `Paste this URL into your browser and follow the instructions to fix: \n \n ${authUrl} \n`
                )
            });
            // destroy server so that it won't interfere with the application server.
            destroyer(tempServer);
        });
    }
}

module.exports = GoogleAuth;