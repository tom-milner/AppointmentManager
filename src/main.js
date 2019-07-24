import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import AuthenticationService from "@/services/AuthenticationService";

// ################### SETUP AUTHENTICATION SERVICE ##############################
// The authentication service includes all the business logic code that is used when authenticating / deauthenticating users.

// check to see if the user already has a token stored from a past session
AuthenticationService.initialPersistenceCheck();

// setup navigation guard
AuthenticationService.initializeNavigationGuard();



Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')