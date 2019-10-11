import Vue from 'vue'
import Router from 'vue-router'
import WorkCalendarPage from '@/components/pages/CounsellorPages/WorkCalendarPage/WorkCalendarPage.vue'
import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'
import LoginPage from '@/components/pages/AuthPages/LoginPage/LoginPage.vue'
import RegisterPage from "@/components/pages/AuthPages/RegisterPage/RegisterPage.vue"
import HomePage from "@/components/pages/HomePage/HomePage.vue";
import CreateAppointmentPage from "@/components/pages/CreateAppointmentPage/CreateAppointmentPage";
import ManageClientsPage from "@/components/pages/CounsellorPages/ManageClientsPage/ManageClientsPage";
import AppointmentSettingsPage from "@/components/pages/CounsellorPages/AppointmentSettingsPage/AppointmentSettingsPage";
import ForgotPasswordPage from "@/components/pages/AuthPages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "@/components/pages/AuthPages/ResetPasswordPage/ResetPasswordPage";
import GuestPage from "@/components/pages/AuthPages/GuestPage/GuestPage"
import Role from "@/models/Role";
// Sets up the different frontend routes 
// e.g. /login will lead to the login page

Vue.use(Router)

// define the routes for the app.
let router = new Router({
  mode: "history",
  routes: [

    // Landing Page
    {
      path: "/",
      name: "LandingPage",
      component: LandingPage,
      meta: {
        hideNavigation: true
      }
    },

    // Counsellor Routes

    {
      path: '/counsellor/calendar',
      name: 'WorkCalendarPage',
      component: WorkCalendarPage,
      meta: {
        minimumAuthRole: Role.Counsellor
      }
    },
    {
      path: "/counsellor/appointment-settings",
      name: "AppointmentSettingsPage",
      component: AppointmentSettingsPage,
      meta: {
        minimumAuthRole: Role.Counsellor
      }
    },
    {
      path: "/counsellor/clients",
      name: "ManageClientsPage",
      component: ManageClientsPage,
      meta: {
        minimumAuthRole: Role.Counsellor
      }
    },


    // Authentication Routes
    {
      path: "/auth/login",
      name: "LoginPage",
      component: LoginPage,
      meta: {
        hideNavigation: true
      }
    },
    {
      path: "/auth/register",
      name: "RegisterPage",
      component: RegisterPage,
      meta: {
        hideNavigation: true
      },
    },
    {
      path: "/auth/guest/:counsellorId",
      name: "GuestPage",
      component: GuestPage,
      meta: {
        hideNavigation: true
      }

    },
    // forgot password route
    {
      path: "/auth/forgot-password",
      name: "ForgotPasswordPage",
      component: ForgotPasswordPage,
      meta: {
        hideNavigation: true
      }
    },

    {
      path: "/auth/reset-password",
      name: "ResetPasswordPage",
      component: ResetPasswordPage,
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