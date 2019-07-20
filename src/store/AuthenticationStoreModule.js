import AuthenticationService from "@/services/AuthenticationService";

// This file contains all the authentication state management.
// Data to be made persistent
const state = {
  token: localStorage.getItem("token") || "",
  user: {}
};

// changes the state
const mutations = {
  // authentication mutations
  auth_success(state, {
    token,
    user
  }) {
    state.token = token;
    state.user = user;
    state.status = "success";
  },
  auth_request(state) {
    state.status = "loading";
  },
  auth_error(state) {
    state.status = "error";
  },
  auth_logout(state) {
    state.status = "";
    state.token = "";
  }
};

// calls mutations
const actions = {
  // action to login user
  async login({
    commit
  }, {
    username,
    password
  }) {
    // return a promise for easier error handling.
    // call "auth_request" action
    commit("auth_request");
    // attempt to login user
    try {
      const response = await AuthenticationService.loginUser(
        username,
        password
      );
      const token = response.token;
      const user = response.user;
      // store token and current user in store
      commit("auth_success", {
        token,
        user
      });
      return response;
    } catch (err) {
      commit("auth_error");
      throw err;
    }
  },

  // action to register user
  async register({
    commit
  }, newUser) {
    commit("auth_request");
    try {
      // attempt to register user
      const result = await AuthenticationService.registerUser(newUser);
      const token = result.token;
      const user = result.user;
      // store token and new user in store
      commit("auth_success", {
        token,
        user
      });
      return result;
    } catch (err) {
      throw err;
    }
  },

  logout({
    commit
  }) {
    commit("auth_logout");
    return AuthenticationService.logoutUser();
  },
};


const getters = {
  isLoggedIn: state => !!state.token, // will return true if logged in
  authStatus: state => state.status,
}

export const authentication = {
  // "namespaced: true" makes the store modular - properties will have to be accessed via paths
  // e.g.  authentication/auth_success
  namespaced: true,
  state,
  actions,
  getters,
  mutations
};