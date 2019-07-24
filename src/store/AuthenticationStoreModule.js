import UserService from "@/services/UserService";

// This file contains all the authentication state management.


// The data to be kept in the store.
const state = {
  token: "",
  user: {}
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
  }
};

// Actions are used to call mutations. They defer from mutations by having the possibility of being asynchronous.
const actions = {
  // action to login user
  async login({
    commit
  }, {
    username,
    password
  }) {
    // call "auth_request" mutation so that any service depending on the user token knows the authentication process is underway.
    commit("auth_request");
    // attempt to login user
    try {
      const response = await UserService.loginUser(
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
      const result = await UserService.registerUser(newUser);
      const token = result.token;
      const user = result.user;
      // store token and new user in store
      commit("auth_success", {
        token,
        user
      });
      return result;
    } catch (err) {
      commit("auth_error")
      throw err;
    }
  },

  logout({
    commit
  }) {
    commit("auth_logout");
    return UserService.logoutUser();
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