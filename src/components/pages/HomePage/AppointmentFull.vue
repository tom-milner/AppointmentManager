<template>
  <div class="wrapper">
    <h2 class="heading-2">{{appointment.title}}</h2>

    <ul class="appointment-details">
      <li>
        <icon class="icon" name="user"></icon>
      </li>
      <li>
        <icon class="icon" name="map-pin"></icon>
      </li>
    </ul>
  </div>
</template>

<script>
import Icon from "vue-icon/lib/vue-feather.esm";

export default {
  props: {
    appointment: {}
  },
  components: {
    Icon
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 1rem;
  text-align: center;
}

.appointment-details {
  list-style: none;
  text-align: left;
  margin-top: 2rem;
  li {
    &:not(:last-child) {
      margin-bottom: 2rem;
    }

    .icon {
      width: 2rem;
      height: 2rem;
    }
  }
}
</style>
