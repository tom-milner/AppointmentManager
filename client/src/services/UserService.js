// This file contains functions for all user actions.

import Api from "@/services/Api.js";
import Store from "@/store/store";
import Role from "@/models/Role";
import Router from "@/routes";

import AuthenticationService from "@/services/AuthenticationService";

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
async function logoutUser({
    fullyLogout
}) {
    try {
        if (Store.getters["authentication/isLoggedIn"]) {
            // send request to logout user.
            await Api.post("/auth/logout", fullyLogout);
        }

        Store.commit("authentication/auth_logout", fullyLogout);
        Router.push("/");
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
            let tokenKeys = [
                "firstname",
                "lastname",
                "username",
                "role"
            ];

            // If userInfo contains any of the token keys. 
            if ((Object.keys(userInfo)).some((key) => tokenKeys.find((info) => key == info))) {
                await AuthenticationService.refreshAccessToken();
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
    return Api.get("/user/clients")
}


function getClient(clientId) {
    return Api.get(`/user/clients/full/${clientId}`);
}



export default {
    loginUser,
    registerUser,
    logoutUser,
    deleteUser,
    getUsersFromIds,
    getAllCounsellors,
    getReducedCounsellor,
    getCounsellor,
    getAllClients,
    updateUser,
    getClient,
    sendNewCounsellorEmail
}