import Api from "@/services/Api.js";
import Axios from "axios";
import store from "@/store/store";
import router from "@/router";
// Helper functions
function useToken(token) {
  localStorage.setItem("token", token);
  Axios.defaults.headers.common["Authorization"] = token;
}

function removeToken() {
  localStorage.removeItem("token");
  delete Axios.defaults.headers.common["Authorization"];
}

export default {

  // These function are triggered by user events
  // Login user
  async loginUser(username, password) {
    // Send post request to login route
    console.log(username, password);
    try {
      const result = await Api().post("/auth/login", {
        username: username,
        password: password
      });
      console.log(result.data);
      // store token in axios headers and local storage.
      useToken(result.data.token);
      return result.data;
    } catch (err) {
      console.log(err.response.data);
      // invalid token - remove it from storage
      removeToken();
      throw err.response.data;
    }
  },

  // Register User
  async registerUser(user) {
    try {
      // Send post request to register route
      const result = await Api().post("/auth/register", user);
      useToken(result.data.token);
      return result.data;
    } catch (err) {
      console.log(err.response);
      throw err.response.data;
    }
  },

  // Logout User
  logoutUser() {
    try {
      removeToken();
      return true;
    } catch (err) {
      console.log(err);
      return err;
    }
  },

  // These functions are ran automatically

  // initial check when user first accesses app
  initialTokenCheck() {
    // Check to see if user already has valid token in storage.
    const token = localStorage.getItem("token");
    if (token) {
      useToken(token);
    }
  },

  // intercept 401 responses (expired token) and redirect to login page
  expiredTokenInterceptor() {
    Axios.interceptors.response.use(undefined, function (err) {
      // check to see if the error from the server is a 401 error
      if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
        // token must be expired - clear token in store
        store.dispatch("authentication/logout");
        // We don't have to redirect the user to the login page - the router navigation guard will detect the absence of a cookie and redirect for us.
      }
      // return the error 
      throw Promise.reject(err);
    });
  },

  initializeNavigationGuard() {
    console.log(this);
    // Handle unauthorized access
    // This is a navigation guard. It is called every time the user tries to navigate to a different route.
    // It takes the route the user is going to, the route the user came from, and a function called next.
    // The next function will either allow navigation to the "to" route, or redirect the user.
    router.beforeEach((to, from, next) => {
      if (to.matched.some(record => record.meta.requiresAuth)) { // If any routes have the "requiresAuth" meta property set to true
        if (store.getters["authentication/isLoggedIn"]) {
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
};