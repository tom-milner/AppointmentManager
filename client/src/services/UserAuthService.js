import Api from "./Api";
import Store from "../store/store";
import Roles from "../models/Roles";
import Router from "../routes/index";

// This file handles any authentication to do with specifically user authentication.
// The content of this file was originally a part of AuthenticationService.js, but was moved into this file to avoid circular dependencies.

// Login user
function loginUser(username, password) {
  // Send post request to login route
  return new Promise((resolve, reject) => {
    Store.commit("authentication/auth_request");
    let loginInfo = {
      username: username,
      password: password
    };

    return Api.post("/auth/login", loginInfo)
      .then(res => {
        const accessToken = res.data.accessToken;
        const refreshToken = res.data.refreshToken;
        const user = res.data.user;

        // Store token and basic user info in vuex, so that it can be accessed globally.
        Store.commit("authentication/auth_success", {
          accessToken,
          refreshToken,
          user
        });

        resolve(res);
      })
      .catch(err => {
        Store.commit("authentication/auth_error");
        reject(err);
      });
  });
}

// Register User
function registerUser(newUser, role) {
  let userEndpoint = "";
  switch (role) {
    case Roles.GUEST:
      userEndpoint = "guest";
      break;
    case Roles.CLIENT:
    default:
      // default is sign users up as client
      userEndpoint = "client";
      break;
    case Roles.COUNSELLOR:
      userEndpoint = "counsellor";
      break;
  }

  // Send post request to register route
  return Api.post(`/auth/register/${userEndpoint}`, newUser);
}

// Logout User
async function logoutUser() {
  try {
    if (Store.getters["authentication/isLoggedIn"]) {
      // send request to logout user.
      await Api.post("/auth/logout");
    }
    Store.commit("authentication/auth_logout");
    Router.push("/");
  } catch (err) {
    Store.commit("authentication/auth_error");
    console.log(err);
    return err;
  }
}

export default {
  loginUser,
  registerUser,
  logoutUser
};
