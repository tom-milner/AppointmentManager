<template>
  <div class="wrapper">
    <div class="heading-box">
      <h3 class="heading-3">{{appointment.title}}</h3>
    </div>
    <div class="info-box">
      <p class="date">{{appointment.appointmentType.name}}</p>
      <p class="date">{{formattedTime}}</p>
      <p class="date">{{formattedDate}}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    appointment: Object
  },
  computed: {
    formattedDate() {
      return this.moment(this.appointment.startTime).format("dddd Do MMMM");
    },
    formattedTime() {
      return this.moment(this.appointment.startTime).format("LT");
    }
  },
  data() {
    return {};
  },

  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
$card-width: 15.3rem;
.wrapper {
  height: $card-width;
  min-width: $card-width;
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
    h4,
    h3 {
      word-break: break-word;
      color: $color-white;
    }
  }
  .info-box {
    text-align: center;
    // width: 80%;
    margin-bottom: 1rem;

    .date {
      font-size: 1.5rem;
      word-break: break-word;
      color: $color-white;
    }
  }
}
</style>
