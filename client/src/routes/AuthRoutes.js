/*
    This file is for setting up the Authentication Routes - all the routes to do with authenticating a user e.g. logging in, signing up etc.
 */

import LoginPage from "@/components/pages/AuthPages/LoginPage.vue";
import RegisterPage from "@/components/pages/AuthPages/RegisterPage.vue";
import ForgotPasswordPage from "@/components/pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "@/components/pages/AuthPages/ResetPasswordPage";
import GuestPage from "@/components/pages/AuthPages/GuestPage";

// All client routes that are to do with authentication are stored here.

export default [
  // Login Route
  {
    path: "/auth/login",
    name: "LoginPage",
    component: LoginPage,
    meta: {
      hideNavigation: true // The navigation bar shouldn't be shown here.
    }
  },

  // Register Route
  {
    path: "/auth/register",
    name: "RegisterPage",
    component: RegisterPage,
    meta: {
      hideNavigation: true
    }
  },

  // Guest Route
  {
    path: "/auth/guest/:counsellorId",
    name: "GuestPage",
    component: GuestPage,
    meta: {
      hideNavigation: true
    }
  },

  // Forgot Password Route
  {
    path: "/auth/forgot-password",
    name: "ForgotPasswordPage",
    component: ForgotPasswordPage,
    meta: {
      hideNavigation: true
    }
  },

  // Reset Password Route
  {
    path: "/auth/reset-password",
    name: "ResetPasswordPage",
    component: ResetPasswordPage,
    meta: {
      hideNavigation: true
    }
  }
];
