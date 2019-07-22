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
export default {
  components: {
    Card
  },

  methods: {
    logout: async function() {
      await this.$store.dispatch("authentication/logout");
      this.$router.push("/");
    },
    getUserAppointments: async function() {
      this.user = this.$store.state.authentication.user;
      console.log(this.user);
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
