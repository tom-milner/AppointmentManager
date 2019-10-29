import Store from "@/store/store";
import Router from "@/routes";
import Api from "@/services/Api";
import UserService from "@/services/UserService";
import Utils from "@/utils";

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

        if (minimumAuthRole) { // If any routes require authentication
            let isLoggedIn = Store.getters["authentication/isLoggedIn"];
            if (isLoggedIn) {

                // Make sure the user exists in store
                // The store is wiped on refresh, so this makes sure that there is always a user in the store.
                if (!Store.state.authentication.user._id) { // No user in store.
                    let accessToken = Store.state.authentication.accessToken;

                    if (!accessToken) {
                        // refresh access token
                        await refreshAccessToken();
                    }
                    let currentAccessToken = Store.state.authentication.accessToken;
                    Store.state.authentication.user = Utils.getTokenPayload(currentAccessToken);
                }

                // check to see if the user has the required access levels
                let currentUserRole = Store.state.authentication.user.role;
                if (currentUserRole >= minimumAuthRole) {
                    // allow the user to continue to their chosen route, as they are logged in 
                    next();

                } else {
                    next("/home");
                }
            } else {
                // make the user login first.
                next("/auth/login");
            }
        } else {
            // route does not require user to be logged in - let them through
            next();
        }
    });
}

// intercept requests and check if token is still valid.
async function setupTokenRefresher(config) {

    let accessToken = Store.state.authentication.accessToken;

    // ignore requests to register or signup routes - these are already getting new tokens.
    // also only allow refresh if token exists, and if the token isn't currently being updated
    if (((config.url).includes("auth") && !config.url.includes("logout")) || !accessToken || Store.state
        .authentication
        .status == "loading" || Store.state.authentication.status == "error") {
        return config;
    }

    // try and decode token
    try {
        // check how long token is valid for.
        let decodedPayload = Utils.getTokenPayload(accessToken);

        let currentTime = Date.now();
        let tokenExpiryTime = decodedPayload.exp * 1000;
        let timeToExpire = tokenExpiryTime - currentTime;

        // If token has expired, renew it
        if (timeToExpire <= 0) {
            await refreshAccessToken();
        }

        config.headers.Authorization = "Bearer " + Store.state.authentication.accessToken;

    } catch (err) {
        console.log(err);
        // Refresh token is invalid
        UserService.logoutUser({
            fullyLogout: true
        });
    }
    return config;
}

// intercept 401 responses (expired token) and redirect to login page
async function setupAccessDeniedResponseInterceptor(err) {
    // check to see if the error from the server is a 401 error
    if ((err.response.status == 401 && err.config && !err.config.__isRetryRequest && !err.config.url.includes(
            "/auth"))) {
        // token must be expired - clear token in store
        try {
            await refreshAccessToken();
        } catch (err) {
            UserService.logoutUser({
                fullyLogout: true
            });
        }
    }
    // return the error 
    return Promise.reject(err);
}


function refreshAccessToken() {
    // let other services know token is changing 
    return new Promise(async (resolve, reject) => {
        console.log("refreshing access token...")
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

            console.log(error);
            Store.commit("authentication/auth_error");
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