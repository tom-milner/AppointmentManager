// This file contains functions for all user actions.

import Api from "@/services/Api.js";
import Store from "@/store/store";
import Role from "@/models/Role"

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
async function registerUser(newUser, role) {
    Store.commit("authentication/auth_request");

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
    const result = await Api.post(`/auth/register/${userEndpoint}`, newUser);
    console.log(result.data);
    if (result.data.success) {
        const token = result.data.token;
        const user = result.data.user;
        console.log(token, user);
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


// delete user
function deleteUser(user) {
    return Api.post(`/user/delete/${user._id}`)
}

function sendNewCounsellorEmail(toEmail) {
    return Api.post("/user/counsellors/send-email", {
        email: toEmail
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