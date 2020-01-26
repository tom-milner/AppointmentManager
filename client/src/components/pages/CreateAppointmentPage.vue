<template>
  <div>
    <!-- Header -->
    <h2 class="heading-2">Book An Appointment</h2>
    <!-- Form - all the logic is self-contained -->
    <div class="create-appointment">
      <CreateAppointmentForm @appointment-created="$router.push('/')" :user="user"></CreateAppointmentForm>
    </div>
  </div>
</template>

<script>
import CreateAppointmentForm from "@/components/misc/CreateAppointmentForm.vue";
export default {
  components: {
    CreateAppointmentForm
  },
  data() {
    return {
      user: {}
    };
  },
  beforeMount() {
    this.user = this.$store.state.authentication.user;
  }
};
</script>

<style lang="scss" scoped>
.create-appointment {
  width: 50%;
}
</style>
