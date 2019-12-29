import Store from "@/store/store";
import Router from "@/routes";
import Api from "@/services/Api";
import Utils from "@/utils";
import Role from "../models/Role";

function forgotPassword(email) {
    return Api.post("/auth/forgot-password", {
        email: email
    });
}

function resetPassword(password, token) {
    return Api.post("/auth/reset-password", {
        token: token,
        password: password
    })
}

function initializeNavigationGuard() {
    // This is a navigation guard. It is called every time the user tries to navigate to a different route.
    // It takes the route the user is going to, the route the user came from, and a function called next.
    // The next function will either allow navigation to the "to" route, or redirect the user.
    Router.beforeEach(async (to, from, next) => {
        const {
            minimumAuthRole
        } = to.meta;
        let currentUser = Store.state.authentication.user;

        let isLoggedIn = Store.getters["authentication/isLoggedIn"];

        // If the user doesn't need to be logged in let them through.
        if (!minimumAuthRole) {

            // Users can't login or register if they are already in a session.
            if ((to.path.includes("login") || to.path.includes("register")) && isLoggedIn && currentUser
                .role > Role.Guest) {
                return next(from.path);
            }
            return next();
        }

        // If the user isn't logged in, send them to the login page.
        if (!isLoggedIn) return next("/auth/login");

        // Make sure there is a valid access token.
        let accessToken = Store.state.authentication.accessToken;
        if (!accessToken) {
            // If there's no current access token, get a new one.
            try {
                // refresh access token
                accessToken = await refreshAccessToken();
            } catch (error) {
                console.log("Error refreshing token");

            }
        }

        // Make sure the user exists in store
        // The store is wiped on refresh, so this makes sure that there is always a user in the store.
        if (!currentUser) { // No user in store.
            currentUser = Utils.getTokenPayload(accessToken);
            Store.commit("authentication/auth_success", {
                user: currentUser
            });
        }


        // check to see if the user has the required access levels
        if (currentUser.role >= minimumAuthRole) {
            // allow the user to continue to their chosen route, as they are logged in 
            next();
        } else {
            // The user doesn't have access to this page - send them to the landing page.
            next("/");
        }
    });
}

// intercept requests and check if token is still valid.
async function setupTokenRefresher(config) {
    // This function is run before every axios request.
    // It makes sure that the request about to be sent has a valid access token attached.

    let accessToken = Store.state.authentication.accessToken;

    // ignore requests to all authentication routes except "logout" - these are already getting new tokens.
    // also only allow refresh if token exists, and if the token isn't currently being updated
    if ((config.url.includes("auth") && !config.url.includes("logout")) || !accessToken || Store.state
        .authentication
        .status == "loading" || Store.state.authentication.status == "error") {
        return config;
    }

    // check how long token is valid for.
    let decodedPayload = Utils.getTokenPayload(accessToken);
    let currentTime = Date.now();
    let tokenExpiryTime = decodedPayload.exp * 1000;
    let timeToExpire = tokenExpiryTime - currentTime;

    // If token has expired, renew it
    if (timeToExpire <= 0) {
        try {
            await refreshAccessToken();
        } catch (error) {
            // If the token refresh fails, 
        }
    }

    config.headers.Authorization = "Bearer " + Store.state.authentication.accessToken;

    return config;
}

// intercept 401 responses (expired token) and redirect to login page
async function setupAccessDeniedResponseInterceptor(err) {
    // check to see if the error from the server is a 401 error
    if ((err.response.status == 401 && err.config && !err.config.__isRetryRequest && !err.config.url.includes(
            "/auth"))) {
        // If we are receiving a 401 error, the access token must be expired. Therefore, try and refresh it.
        try {
            await refreshAccessToken();
        } catch (err) {
            console.log(err);
            console.log("Invalid token.")
        }
    }
    // return the error 
    return Promise.reject(err);
}


function refreshAccessToken() {
    // let other services know token is changing 
    return new Promise(async (resolve, reject) => {
        console.log("Refreshing access token...")
        try {
            Store.commit("authentication/auth_request");

            const refreshToken = Store.state.authentication.refreshToken;
            let response = await Api.get("/auth/token", {
                params: {
                    refreshToken: refreshToken
                }
            });

            const accessToken = response.data.accessToken;
            Store.commit("authentication/auth_success", {
                accessToken,
            });

            resolve(accessToken);
        } catch (error) {
            // If there is an error refreshing a token, flush the tokens (As the refresh token is likely invalid).
            console.log(error);
            Store.commit("authentication/auth_logout", true);
            reject(error);
        }
    });

}

// expose functions
export default {
    initializeNavigationGuard,
    setupAccessDeniedResponseInterceptor,
    setupTokenRefresher,
    forgotPassword,
    resetPassword,
    refreshAccessToken
}