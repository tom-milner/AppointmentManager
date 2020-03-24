import Vue from "vue";
import App from "./App.vue";
import router from "./routes";
import store from "./store/store";
import AuthenticationService from "@/services/AuthenticationService";

// This is the root file of the client app.

// Attach Icon component to all components.
import Icon from "vue-icon/lib/vue-feather.esm";
Vue.component("icon", Icon);

// Setup moment for date time formatting and attach to prototype for global use
import moment from "moment";
Vue.prototype.moment = moment;

// setup navigation guard
AuthenticationService.initializeNavigationGuard();

// Set title.
document.title = "Appointment Manager";

Vue.config.productionTip = false;
// Mount vue app.
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
