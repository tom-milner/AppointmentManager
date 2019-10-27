// This file contains functions for all user actions.

import Api from "@/services/Api.js";
import Store from "@/store/store";
import Role from "@/models/Role"

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
            .then((res) => {
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
            }).catch((err) => {
                Store.commit("authentication/auth_error");
                reject(err);
            });
    });
}

// Register User
function registerUser(newUser, role) {

    let userEndpoint = "";
    switch (role) {
        case Role.Guest:
            userEndpoint = "guest"
            break;
        case Role.Client:
        default:
            // default is sign users up as client
            userEndpoint = "client";
            break;
        case Role.Counsellor:
            userEndpoint = "counsellor"
            break;
    }

    // Send post request to register route
    return Api.post(`/auth/register/${userEndpoint}`, newUser);
}


// Logout User
function logoutUser({
    fullyLogout
}) {
    try {
        Store.commit("authentication/auth_logout", fullyLogout);
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


// delete user
function deleteUser(userId) {
    return Api.post(`/user/delete/${userId}`)
}

function sendNewCounsellorEmail(toEmail, password) {
    return Api.post("/user/counsellors/send-email", {
        email: toEmail,
        counsellorPassword: password
    })
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

function getReducedCounsellor(counsellorId) {
    return Api.get(`/user/counsellors/${counsellorId}`);
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
    deleteUser,
    getUsersFromIds,
    getAllCounsellors,
    updateCounsellor,
    getReducedCounsellor,
    getCounsellor,
    getAllClients,
    updateClient,
    getClient,
    sendNewCounsellorEmail
}