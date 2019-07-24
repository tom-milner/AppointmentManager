import Store from "@/store/store";
import Router from "@/router";
import UserService from "@/services/UserService";

// initial check when user first accesses app
function initialPersistenceCheck() {
  // Check to see if user already has valid token and user info in storage.
  const {
    token,
    user
  } = UserService.getUserData();
  console.log(user);
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
function setupTokenRefresher() {

  return (config) => {
    let {
      token
    } = UserService.getUserData();

    console.log(token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // request new token
    }
    return config;
  }
}

// intercept 401 responses (expired token) and redirect to login page
function setupAccessDeniedResponseInterceptor() {

  return (err) => {
    // check to see if the error from the server is a 401 error
    if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
      // token must be expired - clear token in store
      Store.dispatch("authentication/logout");
      // We don't have to redirect the user to the login page - the router navigation guard will detect the absence of a cookie and redirect for us.
    }
    // return the error 
    throw Promise.reject(err);
  }
}

// expose functions
export default {
  initialPersistenceCheck,
  initializeNavigationGuard,
  setupAccessDeniedResponseInterceptor,
  setupTokenRefresher
}