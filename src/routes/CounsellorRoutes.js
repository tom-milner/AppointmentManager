import WorkCalendarPage from '@/components/pages/CounsellorPages/WorkCalendarPage/WorkCalendarPage.vue'
import ManageClientsPage from "@/components/pages/CounsellorPages/ManageClientsPage/ManageClientsPage";
import AppointmentSettingsPage from "@/components/pages/CounsellorPages/AppointmentSettingsPage/AppointmentSettingsPage";
import Role from "@/models/Role";
// Counsellor Routes


export default [


  {
    path: '/counsellor/calendar',
    name: 'WorkCalendarPage',
    component: WorkCalendarPage,
    meta: {
      minimumAuthRole: Role.Counsellor
    }
  }, {
    path: "/counsellor/appointment-settings",
    name: "AppointmentSettingsPage",
    component: AppointmentSettingsPage,
    meta: {
      minimumAuthRole: Role.Counsellor
    }
  }, {
    path: "/counsellor/clients",
    name: "ManageClientsPage",
    component: ManageClientsPage,
    meta: {
      minimumAuthRole: Role.Counsellor
    }
  },

]