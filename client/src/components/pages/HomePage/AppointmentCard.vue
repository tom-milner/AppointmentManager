<template>
  <div class="appointment-card-wrapper" :style="getColor">
    <div class="client-status" :class="{'can-attend' : appointment.clientCanAttend} "></div>
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
      return this.moment(this.appointment.startTime).format("dddd Do");
    },
    formattedTime() {
      return this.moment(this.appointment.startTime).format("LT");
    },
    getColor() {
      const color = this.appointment.appointmentType.color;
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);

      return {
        "box-shadow": `0 2px 7px rgba(${r},${g}, ${b}, .5)`,
        "border-bottom": `10px solid ${color} `
      };
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

    .date {
      font-size: 1.5rem;
      word-break: break-word;
      color: $color-grey;
    }
  }
}
</style>
