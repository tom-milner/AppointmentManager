// This file contains functions for all user actions.

import Api from "@/services/Api.js";
import Store from "@/store/store";

import AuthenticationService from "@/services/AuthenticationService";

// get users from array of ids
function getUsersFromIds(userIds) {
  return Api.get("/user", {
    params: {
      userIds: userIds
    }
  });
}

// Delete user
function deleteUser(userId) {
  return Api.post(`/user/delete/${userId}`);
}

// Request the API to send a new counsellor email.
function sendNewCounsellorEmail(toEmail, password) {
  return Api.post("/user/counsellors/send-email", {
    email: toEmail,
    counsellorPassword: password
  });
}

// Get list of all counsellors
function getAllCounsellors() {
  return Api.get("/user/counsellors");
}

// Update an existing user.
function updateUser(userId, userInfo, isCounsellor) {
  return new Promise(async (resolve, reject) => {
    try {
      let response;

      // Request either the counsellor or client endpoint depending on the user's role.
      if (isCounsellor) {
        response = await Api.post(`/user/counsellors/${userId}`, {
          counsellorInfo: userInfo
        });
      } else {
        response = await Api.post(`/user/clients/${userId}`, {
          clientInfo: userInfo
        });
      }
      // If the change will affect the current access token, refresh it.
      let tokenKeys = Object.keys(Store.state.authentication.user);
      const updatedInfoKeys = Object.keys(userInfo);

      // If tokenKeys contains any of the user info keys.
      const clashingKeys = tokenKeys.map(key => updatedInfoKeys.find(info => info == key));
      if (clashingKeys.length > 0) await AuthenticationService.refreshAccessToken();

      // Overwrite user in store with updated info.
      let userKeys = Object.keys(userInfo);
      for (let key of userKeys) {
        Store.state.authentication.user[key] = userInfo[key];
      }

      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}

// Get a counsellor's full information.
function getCounsellor(counsellorId) {
  return Api.get(`/user/counsellors/full/${counsellorId}`);
}

// Get a counsellor's reduced information.
function getReducedCounsellor(counsellorId) {
  return Api.get(`/user/counsellors/${counsellorId}`);
}

// Get all the clients on the system.
function getAllClients() {
  return Api.get("/user/clients");
}

// Get full info about a client.
function getClient(clientId) {
  return Api.get(`/user/clients/full/${clientId}`);
}

export default {
  deleteUser,
  getUsersFromIds,
  getAllCounsellors,
  getReducedCounsellor,
  getCounsellor,
  getAllClients,
  updateUser,
  getClient,
  sendNewCounsellorEmail
};
