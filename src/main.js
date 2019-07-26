import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import AuthenticationService from "@/services/AuthenticationService";

// setup navigation guard
AuthenticationService.initializeNavigationGuard();



Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')