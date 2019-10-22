import LoginPage from '@/components/pages/AuthPages/LoginPage/LoginPage.vue'
import RegisterPage from "@/components/pages/AuthPages/RegisterPage/RegisterPage.vue"
import ForgotPasswordPage from "@/components/pages/AuthPages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "@/components/pages/AuthPages/ResetPasswordPage/ResetPasswordPage";
import GuestPage from "@/components/pages/AuthPages/GuestPage/GuestPage"

export default [
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
]