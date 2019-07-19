import Vue from "vue";
import Vuex from "vuex";
import AuthenticationService from "@/services/AuthenticationService";


// This is the vuex centralised data store. It's used so that multiple components can access the same data.
// For more info: https://vuex.vuejs.org/

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token") || "",
    user: {}
  },
  mutations: {
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
  },
  actions: {
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
          commit("auth_success", token, user)
          resolve(response);
        }).catch((err) => {
          commit("auth_error");
          reject(err);
        });
      });


    }
  }
});