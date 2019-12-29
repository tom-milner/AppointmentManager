// This file contains all the authentication state management.
import Role from "../models/Role";

// The data to be kept in the store.
const state = {
    accessToken: localStorage.getItem("accessToken") || "",
    refreshToken: localStorage.getItem("refreshToken") || "",
    user: "",
    status: ""
};

// Mutations are methods to be ran whenever a state change is needed.
const mutations = {
    // stores token and user in store to be used by other services.
    auth_success(state, {
        accessToken,
        refreshToken,
        user
    }) {

        if (accessToken) state.accessToken = accessToken;
        if (refreshToken) state.refreshToken = refreshToken;
        if (user) state.user = user;
        state.status = "success";

        // make tokens persistent.
        localStorage.setItem("accessToken", state.accessToken);
        localStorage.setItem("refreshToken", state.refreshToken);
    },

    // changes the status to "loading" so any dependent services know to wait.
    auth_request(state) {
        state.status = "loading";
    },
    auth_error(state) {
        state.status = "error";
    },

    // resets token and user
    auth_logout(state, removeRefreshToken) {
        state.status = "";
        state.accessToken = "";
        state.user = "";
        localStorage.removeItem("accessToken");
        if (removeRefreshToken) {
            state.refreshToken = "";
            localStorage.removeItem("refreshToken");
        }
    },
}

const getters = {
    isLoggedIn: state => !!(state.refreshToken || state.accessToken),
    authStatus: state => state.status,
    isCounsellor: state => state.user.role >= Role.Counsellor,
};

export const authentication = {
    // "namespaced: true" makes the store modular - properties will have to be accessed via paths
    // e.g.  authentication/auth_success
    namespaced: true,
    state,
    getters,
    mutations
};