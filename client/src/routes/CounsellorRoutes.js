import WorkCalendarPage from '@/components/pages/CounsellorPages/WorkCalendarPage/WorkCalendarPage.vue'
import ManageClientsPage from "@/components/pages/CounsellorPages/ManageClientsPage/ManageClientsPage";
import AppointmentSettingsPage from "@/components/pages/CounsellorPages/AppointmentSettingsPage/AppointmentSettingsPage";
import UserDetailsPage from "@/components/pages/CounsellorPages/ManageClientsPage/UserDetails"
import Roles from "@/models/Roles";
// Counsellor Routes


export default [


    {
        path: '/counsellor/calendar',
        name: 'WorkCalendarPage',
        component: WorkCalendarPage,
        meta: {
            minimumAuthRole: Roles.COUNSELLOR
        }
    }, {
        path: "/counsellor/appointment-settings",
        name: "AppointmentSettingsPage",
        component: AppointmentSettingsPage,
        meta: {
            minimumAuthRole: Roles.COUNSELLOR
        }
    }, {
        path: "/counsellor/clients",
        name: "ManageClientsPage",
        component: ManageClientsPage,
        meta: {
            minimumAuthRole: Roles.COUNSELLOR
        }
    },
    {
        path: "/counsellor/clients/:clientId",
        name: "UserDetailsPage",
        component: UserDetailsPage,
        meta: {
            minimumAuthRole: Roles.COUNSELLOR
        }
    },


]