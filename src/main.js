import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import AuthenticationService from "@/services/AuthenticationService";



// check to see if the user already has a token stored from a past session
AuthenticationService.initialTokenCheck();

// setup navigation guard
AuthenticationService.initializeNavigationGuard();

// setup 401 interceptor
AuthenticationService.accessDeniedResponseInterceptor();

// setup token refresher
AuthenticationService.setupTokenRefresher();


Vue.config.productionTip = false



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')