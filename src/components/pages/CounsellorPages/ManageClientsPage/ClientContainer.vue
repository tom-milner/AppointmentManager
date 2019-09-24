<template>
  <div class="wrapper">
    <h4 class="heading-4">{{client.firstname}} {{client.lastname}}</h4>
  </div>
</template>

<script>
export default {
  props: {
    client: {}
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global.scss";

.wrapper {
  border-radius: 2px;
  padding: 1rem 2rem;
  background-color: $color-canvas;

  border-left: 4px solid $color-primary;
  position: relative;
  transition: all 0.2s;
  width: 20rem;
  display: inline-block;
}
</style>