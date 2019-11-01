import Vue from "vue";
import App from "./App.vue";
import router from "./routes";
import store from "./store/store";
import AuthenticationService from "@/services/AuthenticationService";

// Setup error monitoring
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
Sentry.init({
    dsn: 'https://56454897973441c8a6a4d93b7286e72f@sentry.io/1804724',
    integrations: [new Integrations.Vue({
        Vue,
        attachProps: true
    })]
});



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