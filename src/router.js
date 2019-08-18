import Vue from 'vue'
import Router from 'vue-router'
import AdminPage from '@/components/pages/AdminPage/AdminPage.vue'
import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'
import LoginPage from '@/components/pages/LoginPage/LoginPage.vue'
import RegisterPage from "@/components/pages/RegisterPage/RegisterPage.vue"
import HomePage from "@/components/pages/HomePage/HomePage.vue";
import CreateAppointmentPage from "@/components/pages/CreateAppointmentPage/CreateAppointmentPage";
import Role from "@/models/Role";
// Sets up the different frontend routes 
// e.g. /login will lead to the login page

Vue.use(Router)

// define the routes for the app.
let router = new Router({
  mode: "history",
  routes: [{
      path: '/admin',
      name: 'AdminPage',
      component: AdminPage,
      meta: {
        minimumAuthRole: Role.Counsellor
      }
    },
    {
      path: "/",
      name: "LandingPage",
      component: LandingPage,
      meta: {
        hideNavigation: true
      }
    },
    {
      path: "/login",
      name: "LoginPage",
      component: LoginPage,
      meta: {
        hideNavigation: true
      }
    },
    {
      path: "/register",
      name: "RegisterPage",
      component: RegisterPage,
      meta: {
        hideNavigation: true
      }
    },
    {
      path: "/home",
      name: "HomePage",
      component: HomePage,
      meta: {
        minimumAuthRole: Role.Client,
      }
    },
    {
      path: "/create",
      name: "CreateAppointmentPage",
      component: CreateAppointmentPage,
      meta: {
        minimumAuthRole: Role.Client
      }
    }
  ]
});


export default router;