/*
    This file is responsible for setting up the web app routes. It imports the Authentication and Counsellor routes and sets up others.
    It then exports the created routes.
*/

import Vue from "vue";
import Router from "vue-router";

import LandingPage from "@/components/pages/LandingPage.vue";
import HomePage from "@/components/pages/HomePage/HomePage.vue";
import BookAppointmentPage from "@/components/pages/BookAppointmentPage";
import ProfilePage from "@/components/pages/ProfilePage";
import Roles from "@/models/Roles";

// import other routes
import CounsellorRoutes from "./CounsellorRoutes";
import AuthRoutes from "./AuthRoutes";

// Sets up the different frontend routes
// e.g. /login will lead to the login page

Vue.use(Router);

// Define the routes for the app.
let router = new Router({
  mode: "history",
  routes: [
    // Add the imported routes.
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
        minimumAuthRole: Roles.CLIENT,
        hideNavigation: false
      }
    },

    // Book Appointment Route
    {
      path: "/book",
      name: "BookAppointmentPage",
      component: BookAppointmentPage,
      meta: {
        minimumAuthRole: Roles.CLIENT,
        hideNavigation: false
      }
    },

    // Profile Page
    {
      path: "/profile",
      name: "ProfilePage",
      component: ProfilePage,
      meta: {
        minimumAuthRole: Roles.CLIENT,
        hideNavigation: false
      }
    },
    // Redirect the user to the home page if they try and access anywhere else.
    {
      path: "*",
      redirect: "/"
    }
  ]
});

export default router;
