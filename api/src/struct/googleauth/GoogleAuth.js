const {google} = require("googleapis");
const http = require("http");
const destroyer = require("server-destroy");
const url = require("url");
const Config = require("../Config");
const fs = require("fs");
const path = require("path");
const Logger = require("../Logger");

// This file is for authenticating with google's gmail API.
// It exposes the gmail access and refresh tokens stored in googleTokens.js
// If the file can't be found, or is corrupt, then new tokens will be requested and the user will have to allow the server access to their gmail account.
class GoogleAuth {
  // Here I use the singleton pattern, so that only one GoogleAuth instance exists at once.
  // Javascript normally uses a module system similar to the singleton pattern which would worked fine, but I wanted to try the singleton pattern.
  constructor() {
    if (!!GoogleAuth.instance) {
      return GoogleAuth.instance;
    }
    GoogleAuth.instance = this;
    this.oauth2Client = {};
    return this;
  }

  /**
   * Get the gmail API client Id
   * @returns clientId
   */
  get clientId() {
    return this.oauth2Client._clientId;
  }

  /**
   * Get the gmail API client secret
   * @returns clientSecret
   */
  get clientSecret() {
    return this.oauth2Client._clientSecret;
  }

  /**
   * Get the gmail API refresh token
   * @returns refreshToken
   */
  get refreshToken() {
    return this.oauth2Client.credentials.refresh_token;
  }

  /**
   * Get the gmail API access token.
   * @returns accessToken
   */
  get accessToken() {
    return this.oauth2Client.credentials.access_token;
  }

  /**
   * Initialise the google authentication service.
   */
  async init() {
    Logger.info("Setting up google APIs...");

    //Load in config variables.
    let {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} = Config.googleAuth;

    if (!(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI)) {
      throw new Error("No google mail config found.");
    }

    // Use the google library to authenticate.
    this.oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    // This is a temporary file, so it's name isn't stored with the environment variables.
    const tokenFileName = "GoogleTokens.json";
    let tokenFilePath = path.resolve(__dirname, tokenFileName);

    // Save file path to the class.
    this.tokenFilePath = tokenFilePath;
    let tokens = {};

    try {
      // Check to see if the application already has a google api token.
      let readFile = fs.readFileSync(tokenFilePath);
      tokens = JSON.parse(readFile);
    } catch (error) {
      // If there is an error something must be wrong with the tokens, so we renew them.

      // 'ENOENT' = "Error no entry" (file couldn't be found)
      if (error.code == "ENOENT") {
        Logger.warn("No google tokens found.");
      } else {
        // the file must be corrupt - delete it.
        Logger.error(`${tokenFileName} is corrupt or doesn't exist. Deleting...`);
        fs.unlinkSync(tokenFilePath);
      }

      // Create new tokens
      const scopes = "http://mail.google.com"; // What part of the google API we want access to.
      tokens = await this.authenticate(scopes);

      // save new tokens to file
      fs.writeFileSync(tokenFilePath, JSON.stringify(tokens));
    }

    Logger.info("Google tokens found.");
    // Save the tokens to the class.
    this.oauth2Client.credentials = tokens;
  }

  // TODO: contain all this functionality in an express route so that the API can run without having to be connected to an email account.

  /**
   * This function authenticates the API with the google API.
   * It generates a link that the admin of the application must visit to authenticate the API with a chosen gmail account.
   * It then creates a temporary web server to receive an authentication code from the google API, which is used to gain and access and refresh token for the gmail API.
   * @param {String} scope - The part of the google API that we want to access.
   * @returns {Promise} - A promise that when resolved will contain the new access and refresh tokens for the gmail API.
   */
  authenticate(scope) {
    return new Promise((resolve, reject) => {
      // Generate a url that will produce a code that can be used to generate refresh and access tokens.
      // The url will lead to a google sign in page, requiring the user to authentication the application with their chosen email account.
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scope
      });

      // The handler for the /oauth2 route.
      const authHandler = async (req, res) => {
        if (req.url.includes("/oauth2")) {
          try {
            // Get the authentication code using the URL library.
            const code = new url.URL(req.url, Config.API_URL).searchParams.get("code");
            Logger.info(`Received code.`);

            // Generate new tokens.
            const {tokens} = await this.oauth2Client.getToken(code);

            // send success message to webpage
            res.end("Authentication Successfull.");
            // destroy the temporary server.
            tempServer.destroy();

            resolve(tokens);
          } catch (error) {
            res.end("Error authenticating email.");
            Logger.error("Error authenticating gmail account", error);
            reject(error);
          }
        }
      };

      // Create a temporary webserver that the user will be directed to once they have authenticated the app.
      // The user redirect will contain the code that is needed to generate the refresh and access tokens.
      // NOTE: I don't use an express route for this as the route needs to be destroyed as soon as it's used. The route is also only needed once (and for a couple minutes max).
      const tempServer = http.createServer(authHandler);

      // Attach a destroyer function to the server so it can be destroyed.
      destroyer(tempServer);

      // Listen on the API port.
      tempServer.listen(Config.PORT, () => {
        Logger.info(`Auth server running on ${Config.PORT}`);
        Logger.warn(`Paste this URL into your browser and follow the instructions to fix: \n \n ${authUrl} \n`);
      });
    });
  }

  /**
   * This function resets the google API tokens. It's for when the API is restarted after a long time and the refresh token has expired.
   */
  reset() {
    Logger.info("Resetting google tokens.");
    // Remove the tokens. This will trigger the authentication process to restart.
    fs.unlinkSync(this.tokenFilePath);
  }
}

module.exports = GoogleAuth;
