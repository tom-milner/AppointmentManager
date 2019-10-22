import Vue from "vue";
import Vuex from "vuex";

import {
  authentication
} from "./AuthenticationStoreModule";

// This is the vuex centralised data store. It's used so that multiple components can access the same data.
// For more info: https://vuex.vuejs.org/

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    authentication
  }
});