<template>
  <div>
    <h1 class="heading-2">Request An Appointment</h1>
    <div class="request-form">
      <div class="form-field">
        <h3 class="form-heading">Appointment Title</h3>
        <input class="form-input" />
      </div>

      <div class="form-field">
        <h3 class="form-heading">Appointment Date</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {}
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.request-form {
  margin-top: 2rem;

  .form-field {
    max-width: 50rem;
    width: auto;
    &:not(:last-of-type) {
      margin-bottom: 1rem;
    }
  }
}
</style>
