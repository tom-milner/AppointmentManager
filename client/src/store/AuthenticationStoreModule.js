// This file contains all the authentication state management.
import Roles from "../models/Roles";

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
  auth_success(state, { accessToken, refreshToken, user }) {
    if (accessToken) state.accessToken = accessToken;
    if (refreshToken) state.refreshToken = refreshToken;
    if (user) state.user = user;
    state.status = "SUCCESS";

    // make tokens persistent (store them in the browser).
    localStorage.setItem("accessToken", state.accessToken);
    localStorage.setItem("refreshToken", state.refreshToken);
  },

  // changes the status to "loading" so any dependent services know to wait.
  auth_request(state) {
    state.status = "LOADING";
  },
  auth_error(state) {
    state.status = "ERROR";
  },

  // Reset tokens and user
  auth_logout(state, removeRefreshToken) {
    state.status = "";
    state.accessToken = "";
    state.user = "";
    localStorage.removeItem("accessToken");
    if (removeRefreshToken) {
      state.refreshToken = "";
      localStorage.removeItem("refreshToken");
    }
  }
};

// Getters are used for common operations so the state doesn't have to be directly requested.
const getters = {
  isLoggedIn: state => !!(state.refreshToken || state.accessToken),
  authStatus: state => state.status,
  isCounsellor: state => state.user.role >= Roles.COUNSELLOR
};

export const authentication = {
  // "namespaced: true" makes the store modular - properties will have to be accessed via paths
  // e.g.  authentication/auth_success
  namespaced: true,
  state,
  getters,
  mutations
};
