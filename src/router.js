import Vue from 'vue'
import Router from 'vue-router'
import AdminPage from '@/components/pages/AdminPage/AdminPage.vue'
import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'
import LoginPage from '@/components/pages/LoginPage/LoginPage.vue'


Vue.use(Router)

export default new Router({
  routes: [{
      path: '/admin',
      name: 'AdminPage',
      component: AdminPage
    },
    {
      path: "/",
      name: "LandingPage",
      component: LandingPage
    },
    {
      path: "/login",
      name: "LoginPage",
      component: LoginPage
    }
  ]
})