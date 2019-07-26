// This file contains functions for all user actions.

import Api from "@/services/Api.js";


// Helper functions
function setUserData(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function getUserData() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    token,
    user
  };
}

function removeUserData() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete Api.defaults.headers.common["Authorization"];
}


// These function are triggered by user events
// Login user
async function loginUser(username, password) {
  // Send post request to login route
  console.log(username, password);
  try {
    const result = await Api.post("/auth/login", {
      username: username,
      password: password
    });
    // store token in axios headers and local storage.
    setUserData(result.data.token, result.data.user);
    return result.data;
  } catch (err) {
    console.log(err.response.data);
    // invalid token - remove it from storage
    removeUserData();
    throw err.response.data;
  }
}

// Register User
async function registerUser(user) {
  try {
    // Send post request to register route
    const result = await Api.post("/auth/register", user);
    setUserData(result.data.token, result.data.user);
    return result.data;
  } catch (err) {
    console.log(err.response);
    throw err.response.data;
  }
}

// Logout User
function logoutUser() {
  try {
    removeUserData();
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
}

export default {
  setUserData,
  getUserData,
  removeUserData,
  loginUser,
  registerUser,
  logoutUser
}