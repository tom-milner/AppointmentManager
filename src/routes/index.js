import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'
import HomePage from "@/components/pages/HomePage/HomePage.vue";
import CreateAppointmentPage from "@/components/pages/CreateAppointmentPage/CreateAppointmentPage";
import Role from "@/models/Role";

// import other routes 
import CounsellorRoutes from "./CounsellorRoutes";
import AuthRoutes from "./AuthRoutes";

// Sets up the different frontend routes 
// e.g. /login will lead to the login page

Vue.use(Router)

// define the routes for the app.
let router = new Router({
  mode: "history",
  routes: [

    ...CounsellorRoutes,
    ...AuthRoutes,


    // Landing Page
    {
      path: "/",
      name: "LandingPage",
      component: LandingPage,
      meta: {
        hideNavigation: true
      }
    },

    // Home page
    {
      path: "/home",
      name: "HomePage",
      component: HomePage,
      meta: {
        minimumAuthRole: Role.Client,
      }
    }, {
      path: "/create",
      name: "CreateAppointmentPage",
      component: CreateAppointmentPage,
      meta: {
        minimumAuthRole: Role.Client
      }
    },
    // 404
    {
      path: "*",
      redirect: "/"
    }
  ]
});


export default router;