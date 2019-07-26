import Store from "@/store/store";
import Router from "@/router";
import UserService from "@/services/UserService";
import Api from "@/services/Api";

// initial check when user first accesses app
function initialPersistenceCheck() {
  console.log("persistence check")
  // Check to see if user already has valid token and user info in storage.
  const {
    token,
    user
  } = UserService.getUserData();
  if (token && user) {
    Store.commit("authentication/auth_success", {
      user,
      token
    })
  }
}

function initializeNavigationGuard() {
  // Handle unauthorized access
  // This is a navigation guard. It is called every time the user tries to navigate to a different route.
  // It takes the route the user is going to, the route the user came from, and a function called next.
  // The next function will either allow navigation to the "to" route, or redirect the user.
  Router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) { // If any routes have the "requiresAuth" meta property set to true
      if (Store.getters["authentication/isLoggedIn"]) {
        // allow the user to continue to their chosen route, as they are logged in 
        next();
        return;
      }
      // make the user login first.
      next("/login")
    } else {
      // route does not require user to be logged in - let them through
      next();
    }
  });
}

// intercept requests and check if token is still valid.
async function setupTokenRefresher(config) {
  console.log(
    config.headers.Authorization);
  let token = Store.state.authentication.token;

  // ignore requests to register or signup routes - these are already getting new tokens.
  // also only allow refresh if token exists, and if the token isn't currently being updated
  if ((config.url).includes("login") || (config.url).includes("register") || !token || Store.state.authentication.status == "loading") {
    return config;
  }

  // check how long token is valid for.
  let tokenParts = token.split(".");
  // token payload is the second part of a JWT.
  let tokenPayload = tokenParts[1];
  // the token payload is base64 encoded, so we decode it and parse it into a useable javascript object.
  let decodedPayload = JSON.parse(atob(tokenPayload));

  let currentTime = Date.now();
  let tokenExpiryTime = decodedPayload.exp * 1000;
  let timeToExpire = tokenExpiryTime - currentTime;
  console.log(timeToExpire);

  // check that token isn't already being requested
  // If token is set to expire in less than 2 seconds, renew it
  if (timeToExpire <= 18000 && timeToExpire >= 0) {
    // let other services know token is changing 
    Store.commit("authentication/auth_request");
    console.log("refreshing token")

    // here we have to set the access token manually, as we are in the process of setting up the global axios instance and so cannot access the global headers.
    let response = await Api.get("/auth/token", {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    Store.commit("authentication/token_refresh", response.data.token)
  }
  config.headers.Authorization = "Bearer " + Store.state.authentication.token;
  console.log(config.headers.Authorization);
  console.log(config);
  return config;
}

// intercept 401 responses (expired token) and redirect to login page
function setupAccessDeniedResponseInterceptor(err) {
  console.log(err);
  // check to see if the error from the server is a 401 error
  if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
    // token must be expired - clear token in store
    Store.dispatch("authentication/logout");
    // Redirect user to login page.
    Router.push("/login");
  }
  // return the error 
  return Promise.reject(err);
}




// expose functions
export default {
  initialPersistenceCheck,
  initializeNavigationGuard,
  setupAccessDeniedResponseInterceptor,
  setupTokenRefresher
}