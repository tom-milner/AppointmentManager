import Vue from 'vue'
import Router from 'vue-router'
import AdminPage from '@/components/pages/AdminPage/AdminPage.vue'
import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'
import LoginPage from '@/components/pages/LoginPage/LoginPage.vue'
import RegisterPage from "@/components/pages/RegisterPage/RegisterPage.vue"
import HomePage from "@/components/pages/HomePage/HomePage.vue";
// Sets up the different frontend routes 
// e.g. /login will lead to the login page

Vue.use(Router)

// define the routes for the app.
let router = new Router({
  mode: "history",
  routes: [{
      path: '/admin',
      name: 'AdminPage',
      component: AdminPage
    },
    {
      path: "/",
      name: "LandingPage",
      component: LandingPage
    },
    {
      path: "/login",
      name: "LoginPage",
      component: LoginPage
    },
    {
      path: "/register",
      name: "RegisterPage",
      component: RegisterPage
    },
    {
      path: "/home",
      name: "HomePage",
      component: HomePage,
      meta: {
        requiresAuth: true
      }
    }
  ]
});


export default router;