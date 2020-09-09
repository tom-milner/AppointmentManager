<!--
  This file contains the AppointmentCard component.
  It visually conveys essential appointment information to the user by having colour-coded borders and icons.
-->

<template>
  <div class="appointment-card-wrapper" :style="getColor">
    <div class="client-status" :class="{ 'can-attend': appointment.clientCanAttend }"></div>
    <div class="heading-box">
      <h3 class="heading-3">{{ appointment.title }}</h3>
    </div>
    <div class="info-box">
      <p class="row">{{ formattedTime }}</p>
      <p class="row">{{ appointment.appointmentType.duration }} mins</p>
      <p class="row">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    appointment: Object // The appointment information.
  },
  computed: {
    // Get the date in the format 'Monday 1st'
    formattedDate() {
      return this.moment(this.appointment.startTime).format("dddd Do");
    },

    // Get the time in the format '8:30 PM'
    formattedTime() {
      return this.moment(this.appointment.startTime).format("LT");
    },

    // Style the appointment card to be the color of the appointment type.
    getColor() {
      const color = this.appointment.appointmentType.color; // This is a string in the from '#xxyyzz'
      // Split the color into it's rgb components, and then into hex..
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      return {
        "box-shadow": `0 2px 7px rgba(${r},${g}, ${b}, .5)`,
        "border-bottom": `10px solid ${color} `
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
$card-width: 15.3rem;

.appointment-card-wrapper {
  background-color: $color-canvas;
  height: $card-width;
  min-width: $card-width;

  margin: 1rem 0;
  border-radius: 1rem;
  padding: 0.7rem;
  position: relative;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 auto;

  .client-status {
    background-color: $color-error;
    content: "";
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    width: 1.25rem;
    height: 1.25rem;
    shape-outside: circle();
    clip-path: circle();

    &.can-attend {
      background-color: $color-approved;
    }
  }

  &:not(:last-of-type) {
    margin-right: 1.5rem;
  }
  .heading-box {
    text-align: center;
    margin-top: 2rem;
    h4,
    h3 {
      word-break: break-word;
      color: $color-grey-dark;
    }
  }
  .info-box {
    text-align: center;
    // width: 80%;
    margin-bottom: 1rem;

    .row {
      font-size: 1.5rem;
      word-break: break-word;
      color: $color-grey;
    }
  }
}
</style>
