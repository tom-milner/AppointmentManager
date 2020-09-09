<!--
  This file contains the Book Appointment Page.
  It uses the Book Appointment Form to allow the user to book an appointment.
-->

<template>
  <div>
    <!-- Header -->
    <h2 class="heading-2">Book An Appointment</h2>
    <!-- Form - all the logic is self-contained -->
    <div class="book-appointment">
      <BookAppointmentForm @appointment-created="$router.push('/')" :user="user"></BookAppointmentForm>
    </div>
  </div>
</template>

<script>
import BookAppointmentForm from "@/components/misc/BookAppointmentForm.vue";
export default {
  components: {
    BookAppointmentForm
  },
  data() {
    return {
      user: {} // The current user.
    };
  },
  beforeMount() {
    // Get the user from the store.
    this.user = this.$store.state.authentication.user;
  }
};
</script>

<style lang="scss" scoped>
.book-appointment {
  width: 50%;
}
</style>
