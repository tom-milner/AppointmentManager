/*
    This file is for setting up the Counsellor Routes. These are routes that are responsible for any Counsellor operations,
    and so therefore can only be accessed by users with a role of COUNSELLOR or above.
 */

import WorkCalendarPage from "@/components/pages/CounsellorPages/WorkCalendarPage.vue";
import ManageClientsPage from "@/components/pages/CounsellorPages/ManageClientsPage/ManageClientsPage";
import AppointmentSettingsPage from "@/components/pages/CounsellorPages/AppointmentSettingsPage";
import UserDetailsPage from "@/components/pages/CounsellorPages/ManageClientsPage/UserDetails";
import Roles from "@/models/Roles";

// Counsellor Routes
export default [
  // Work Calendar Route.
  {
    path: "/counsellor/calendar",
    name: "WorkCalendarPage",
    component: WorkCalendarPage,
    meta: {
      minimumAuthRole: Roles.COUNSELLOR // Only counsellors or above can access this route.
    }
  },

  // Appointment Settings Route
  {
    path: "/counsellor/appointment-settings",
    name: "AppointmentSettingsPage",
    component: AppointmentSettingsPage,
    meta: {
      minimumAuthRole: Roles.COUNSELLOR
    }
  },

  // Manage Clients Route
  {
    path: "/counsellor/clients",
    name: "ManageClientsPage",
    component: ManageClientsPage,
    meta: {
      minimumAuthRole: Roles.COUNSELLOR
    }
  },

  // User Details Route
  {
    path: "/counsellor/clients/:clientId",
    name: "UserDetailsPage",
    component: UserDetailsPage,
    meta: {
      minimumAuthRole: Roles.COUNSELLOR
    }
  }
];
