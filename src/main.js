import Vue from "vue";
import App from "./App.vue";
import router from "./routes";
import store from "./store/store";
import AuthenticationService from "@/services/AuthenticationService";


// setup moment for date time formatting
import moment from "moment";
// attach moment to prototype for global use
Vue.prototype.moment = moment;

// setup navigation guard
AuthenticationService.initializeNavigationGuard();




Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");