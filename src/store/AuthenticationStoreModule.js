import AuthenticationService from "@/services/AuthenticationService";

// This file contains all the authentication state management controls.

const state = {
  token: localStorage.getItem("token") || "",
  user: {}
};

const mutations = {
  // authentication mutations
  auth_success(state, token, user) {
    state.token = token;
    state.user = user;
  },
  auth_request(state) {
    state.status = "loading";
  },
  auth_error(state) {
    state.status = "error";
  },
  logout(state) {
    state.status = "";
    state.token = "";
  }
};

const actions = {
  // action to login user
  login({
    commit
  }, {
    username,
    password
  }) {
    return new Promise((resolve, reject) => {
      // set status to "loading"
      commit("auth_request");
      // attempt to login user
      AuthenticationService.loginUser(
        username,
        password
      ).then((response) => {
        const token = response.token;
        const user = response.user;
        // call mutation to change state
        commit("auth_success", token, user)
        // return successful (resolved) promise
        resolve(response);
      }).catch((err) => {
        commit("auth_error");
        reject(err);
      });
    });
  }
}

export const authentication = {
  namespaced: true,
  state,
  actions,
  mutations
}