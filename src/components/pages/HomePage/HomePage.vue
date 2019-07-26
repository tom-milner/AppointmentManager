<template>
  <div>
    <Card>
      <a @click="logout">Logout</a>
    </Card>
    <Card>
      <h1></h1>
    </Card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card.vue";
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
export default {
  components: {
    Card
  },

  methods: {
    logout: async function() {
      UserService.logoutUser();
      this.$router.push("/");
    },
    getUserAppointments: async function() {
      this.user = this.$store.state.authentication.user;
      console.log(this.user._id);
      let response = await AppointmentService.getAppointmentsOfUser(
        this.user._id
      );
      this.appointments = response.data.appointments;
    }
  },
  data() {
    return {
      appointments: null,
      user: {}
    };
  },
  mounted: function() {
    this.getUserAppointments();
  }
};
</script>

<style>
</style>
