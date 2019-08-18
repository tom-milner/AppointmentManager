// This file contains all the authentication state management.


// The data to be kept in the store.
const state = {
  token: "" || localStorage.getItem("token"),
  user: ""
};

// Mutations are methods to be ran whenever a state change is needed.
const mutations = {
  // stores token and user in store to be used by other services.
  auth_success(state, {
    token,
    user
  }) {
    state.token = token;
    state.user = user;
    state.status = "success";
    localStorage.setItem("token", token);
  },

  // changes the status to "loading" so any dependent services know to wait.
  auth_request(state) {
    state.status = "loading";
  },
  auth_error(state) {
    state.status = "error";
  },

  // resets token and user
  auth_logout(state) {
    state.status = "";
    state.token = "";
    state.user = "";
    localStorage.removeItem("token");
  },
}

const getters = {
  isLoggedIn: state => !!state.token,
  authStatus: state => state.status
};

export const authentication = {
  // "namespaced: true" makes the store modular - properties will have to be accessed via paths
  // e.g.  authentication/auth_success
  namespaced: true,
  state,
  getters,

  mutations
};