// This file contains functions for all user actions.

import Api from "@/services/Api.js";
import Store from "@/store/store";


// These function are triggered by user events
// Login user
async function loginUser(username, password) {
  // Send post request to login route
  Store.commit("authentication/auth_request");
  try {
    const result = await Api.post("/auth/login", {
      username: username,
      password: password
    });
    const token = result.data.token;
    const user = result.data.user;
    // store token in store
    Store.commit("authentication/auth_success", {
      token,
      user
    });
    console.log(Store.state.authentication.user);
    return result;
  } catch (err) {
    console.log(err.response.data);
    Store.commit("authentication/auth_error")
    // invalid token - remove it from storage
    throw err.response.data;
  }
}

// Register User
async function registerUser(newUser) {
  Store.commit("authentication/auth_request");
  try {
    // Send post request to register route
    const result = await Api.post("/auth/register", newUser);
    const token = result.token;
    const user = result.user;

    // store info in store 
    Store.commit("authentication/auth_success", {
      token,
      user
    });
  } catch (err) {
    Store.commit("authentication/auth_error");
    console.log(err.response);
    throw err.response.data;
  }
}

// Logout User
function logoutUser() {
  try {
    Store.commit("authentication/auth_logout");
  } catch (err) {
    Store.commit("authentication/auth_error");
    console.log(err);
    return err;
  }
}

// get users from array of ids
function getUsersFromIds(userIds) {
  return Api.get("/user", {
    params: {
      userIds: userIds
    }
  });
}

// get list of all counsellors
function getAllCounsellors() {
  return Api.get("user/counsellors");
}

export default {
  loginUser,
  registerUser,
  logoutUser,
  getUsersFromIds,
  getAllCounsellors
}