import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import axios from "axios";

// Check to see if user already has valid token.
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = token;
}

Vue.config.productionTip = false



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')