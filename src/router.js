import Vue from 'vue'
import Router from 'vue-router'
import WorkCalendarPage from '@/components/pages/CounsellorPages/WorkCalendarPage/WorkCalendarPage.vue'
import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'
import LoginPage from '@/components/pages/LoginPage/LoginPage.vue'
import RegisterPage from "@/components/pages/RegisterPage/RegisterPage.vue"
import HomePage from "@/components/pages/HomePage/HomePage.vue";
import CreateAppointmentPage from "@/components/pages/CreateAppointmentPage/CreateAppointmentPage";
import ManageClientsPage from "@/components/pages/CounsellorPages/ManageClientsPage/ManageClientsPage";
import AppointmentSettingsPage from "@/components/pages/CounsellorPages/AppointmentSettingsPage/AppointmentSettingsPage";
import Role from "@/models/Role";
// Sets up the different frontend routes 
// e.g. /login will lead to the login page

Vue.use(Router)

// define the routes for the app.
let router = new Router({
  mode: "history",
  routes: [{
      path: '/calendar',
      name: 'WorkCalendarPage',
      component: WorkCalendarPage,
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
    },
    {
      path: "/appointment-settings",
      name: "AppointmentSettingsPage",
      component: AppointmentSettingsPage,
      meta: {
        minimumAuthRole: Role.Counsellor
      }
    },
    {
      path: "/clients",
      name: "ManageClientsPage",
      component: ManageClientsPage,
      meta: {
        minimumAuthRole: Role.Counsellor
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