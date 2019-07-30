import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import AuthenticationService from "@/services/AuthenticationService";

// setup icons
import Unicon from "vue-unicons";
import {
  uniHomeAlt,
  uniUser,
  uniCalender,
  uniPlus,
  uniCommentAltPlus,
  uniConstructor,
  uniExit
} from "vue-unicons/src/icons";

Unicon.add([
  uniHomeAlt,
  uniUser,
  uniCalender,
  uniPlus,
  uniCommentAltPlus,
  uniConstructor,
  uniExit
]);
Vue.use(Unicon);

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
