<template>
  <div class="wrapper">
    <div class="heading-box">
      <h3 class="heading-3">{{appointmentDate}}</h3>
    </div>
    <div class="info-box">
      <p class="date">{{appointmentTime}}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    appointment: Object
  },
  data() {
    return {
      appointmentDate: "",
      appointmentTime: ""
    };
  },

  mounted() {
    let appointmentStartTime = this.moment(this.appointment.startTime);
    this.appointmentDate = appointmentStartTime.format("dddd Do MMMM");
    this.appointmentTime = appointmentStartTime.format("LT");
    // this.appointmentTime = parts[1]
    // .replace(/\u200E/g, "")
    // .replace(/^([^\d]*\d{1,2}:\d{1,2}):\d{1,2}([^\d]*)$/, "$1$2"); // regex to remove seconds. if seconds column isn't found, nothing is changed.
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
$card-width: 15.3rem;
.wrapper {
  height: $card-width;
  width: $card-width;
  background-color: $color-primary;
  flex: 0 0 auto;
  flex-direction: column;
  margin: 1rem 0;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  display: flex;
  justify-content: space-between;
  padding: 0.7rem;
  align-items: center;
  &:not(:last-of-type) {
    margin-right: 1rem;
  }

  .heading-box {
    text-align: center;
    margin-top: 2rem;
    h3 {
      word-break: break-word;
      color: $color-white;
    }
  }
  .info-box {
    text-align: center;
    width: 80%;
    .date {
      font-size: 1.5rem;
      word-break: break-word;
      color: $color-white;
    }
  }
}
</style>
