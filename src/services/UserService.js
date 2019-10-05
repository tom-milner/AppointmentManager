// This file contains functions for all user actions.

import Api from "@/services/Api.js";
import Store from "@/store/store";


// Login user
async function loginUser(username, password) {
  // Send post request to login route
  Store.commit("authentication/auth_request");

  let loginInfo = {
    username: username,
    password: password
  };
  const result = await Api.post("/auth/login", loginInfo);

  console.log(result);
  if (result.data.success) {
    const token = result.data.token;
    const user = result.data.user;

    // store token in store
    Store.commit("authentication/auth_success", {
      token,
      user
    });

  } else {
    Store.commit("authentication/auth_error")
  }
  return result;

}


// Register User
async function registerUser(newUser) {
  Store.commit("authentication/auth_request");

  // Send post request to register route
  const result = await Api.post("/auth/register", newUser);
  if (result.data.success) {
    const token = result.token;
    const user = result.user;
    // store info in store 
    Store.commit("authentication/auth_success", {
      token,
      user
    });

  } else {
    Store.commit("authentication/auth_error");
  }
  return result;
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
  return Api.get("/user/counsellors");
}

// update counsellor's settings
function updateCounsellor(counsellorId, counsellorInfo) {
  return Api.post(`/user/counsellors/${counsellorId}`, {
    counsellorInfo: counsellorInfo
  });
}

function getCounsellor(counsellorId) {
  return Api.get(`/user/counsellors/full/${counsellorId}`);
}

function getAllClients() {
  return Api.get("/user/clients")
}

function getClient(clientId) {
  return Api.get(`/user/clients/full/${clientId}`);
}

function updateClient(clientId, clientInfo) {
  return Api.post(`/user/clients/${clientId}`, {
    clientInfo: clientInfo
  });
}

export default {
  loginUser,
  registerUser,
  logoutUser,
  getUsersFromIds,
  getAllCounsellors,
  updateCounsellor,
  getCounsellor,
  getAllClients,
  updateClient,
  getClient
}