import Store from "@/store/store";
import Router from "@/router";
import Api from "@/services/Api";
import UserService from "@/services/UserService";
import Utils from "@/utils";



function initializeNavigationGuard() {
  // Handle unauthorized access
  // This is a navigation guard. It is called every time the user tries to navigate to a different route.
  // It takes the route the user is going to, the route the user came from, and a function called next.
  // The next function will either allow navigation to the "to" route, or redirect the user.
  Router.beforeEach((to, from, next) => {
    const {
      minimumAuthRole
    } = to.meta;

    console.log(to.meta);

    if (minimumAuthRole) { // If any routes have the "minimumAuthRole" meta property
      let isLoggedIn = Store.getters["authentication/isLoggedIn"];
      if (isLoggedIn) {
        // make sure the user exists in store
        // the store is wiped on refresh, so this makes sure that there is always a user in the store.
        // the user was originally kept in localStorage but I decided this wasn't secure enough
        if (!Store.state.authentication.user.role) {
          console.log("resetting user");
          let currentToken = Store.state.authentication.token;
          Store.state.authentication.user = Utils.getUserFromToken(currentToken);
        }

        let currentUserRole = Store.state.authentication.user.role;
        console.log(currentUserRole, minimumAuthRole);
        // check to see if the user has the required access levels
        if (currentUserRole >= minimumAuthRole) {
          // allow the user to continue to their chosen route, as they are logged in 
          next();
        } else {
          // redirect the user home - they don't have access to this area
          next("/home");
        }
      } else {
        // make the user login first.
        next("/login");
      }
    } else {
      // route does not require user to be logged in - let them through
      next();
    }
  });
}

// intercept requests and check if token is still valid.
async function setupTokenRefresher(config) {

  let token = Store.state.authentication.token;
  // ignore requests to register or signup routes - these are already getting new tokens.
  // also only allow refresh if token exists, and if the token isn't currently being updated
  if ((config.url).includes("login") || (config.url).includes("register") || !token || Store.state.authentication.status == "loading" || Store.state.authentication.status == "error") {
    console.log(config.headers.post);
    console.log(config.headers.common);

    return config;
  }

  // try and decode token
  try {
    // check how long token is valid for.
    let tokenParts = token.split(".");
    // token payload is the second part of a JWT.
    let tokenPayload = tokenParts[1];
    // the token payload is base64 encoded, so we decode it and parse it into a useable javascript object.
    let decodedPayload = JSON.parse(atob(tokenPayload));
    let currentTime = Date.now();
    let tokenExpiryTime = decodedPayload.exp * 1000;
    let timeToExpire = tokenExpiryTime - currentTime;
    // If token is set to expire in less than 2 seconds, renew it
    const oneHour = 3600000;
    if (timeToExpire <= oneHour && timeToExpire >= 0) {
      // let other services know token is changing 
      Store.commit("authentication/auth_request");

      console.log("refreshing token.");

      // here we have to set the access token manually, as we are in the process of setting up the global axios instance and so cannot access the global headers.
      let response = await Api.get("/auth/token", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      let newToken = response.data.token;
      let user = response.data.user;

      Store.commit("authentication/auth_success", {
        newToken,
        user
      });
    }
    config.headers.Authorization = "Bearer " + Store.state.authentication.token;
  } catch (err) {
    console.log(err);
    // token isn't in valid format - log user out
    UserService.logoutUser();
    Router.push("/");
  }
  return config;
}

// intercept 401 responses (expired token) and redirect to login page
function setupAccessDeniedResponseInterceptor(err) {
  console.log("intercepting");
  console.log(err.config);
  // check to see if the error from the server is a 401 error
  if ((err.response.status == 401 && err.config && !err.config.__isRetryRequest)) {
    // token must be expired - clear token in store
    UserService.logoutUser();
    console.log("logging out");
  }
  // return the error 
  return Promise.reject(err);
}




// expose functions
export default {
  initializeNavigationGuard,
  setupAccessDeniedResponseInterceptor,
  setupTokenRefresher
}