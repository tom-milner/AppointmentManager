<template>
  <div class="wrapper">
    <div class="content">
      <h4 class="heading-4 fullname">{{client.firstname}} {{client.lastname}}</h4>
      <p class="username">{{client.username}}</p>
    </div>
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

  padding-right: 5rem;
  border-left: 4px solid $color-primary;
  position: relative;
  transition: all 0.2s;
  display: inline-block;

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    h4 {
      display: inline-block;
      width: 15rem;
      font-weight: 500;
      margin-right: 5rem;
    }

    p {
      display: inline-block;
      width: 15rem;
      margin-right: 5rem;
      font-weight: 300;
      font-size: 1.5rem;
    }
  }
}
</style>