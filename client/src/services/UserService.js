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

// delete user
function deleteUser(userId) {
  return Api.post(`/user/delete/${userId}`);
}

function sendNewCounsellorEmail(toEmail, password) {
  return Api.post("/user/counsellors/send-email", {
    email: toEmail,
    counsellorPassword: password
  });
}

// get list of all counsellors
function getAllCounsellors() {
  return Api.get("/user/counsellors");
}

function updateUser(userId, userInfo, isCounsellor) {
  return new Promise(async (resolve, reject) => {
    try {
      let response;
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

function getCounsellor(counsellorId) {
  return Api.get(`/user/counsellors/full/${counsellorId}`);
}

function getReducedCounsellor(counsellorId) {
  return Api.get(`/user/counsellors/${counsellorId}`);
}

function getAllClients() {
  return Api.get("/user/clients");
}

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
