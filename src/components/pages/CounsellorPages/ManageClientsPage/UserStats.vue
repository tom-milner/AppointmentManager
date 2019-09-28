<template>
  <div class="wrapper">
    <!-- Heading-->
    <h2 class="heading-2">User Statistics</h2>

    <ul class="user-details">
      <!-- Client name -->
      <li class="user-details-row">
        <h4 class="heading-4 header">Name:</h4>
        <h4 class="heading-4">{{client.firstname}} {{client.lastname}}</h4>
      </li>
      <li class="user-details-row">
        <h4 class="heading-4 header">Username:</h4>
        <h4 class="heading-4">{{client.username}}</h4>
      </li>
      <li class="user-details-row">
        <h4 class="heading-4 header">Email:</h4>
        <h4 class="heading-4">{{client.email}}</h4>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    client: {}
  },
  components: {}
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  text-align: center;
  padding: 1rem;

  .user-details {
    list-style: none;
    text-align: left;
    margin-top: 2rem;

    &-row {
      margin-bottom: 1rem;

      h4 {
        display: inline-block;
      }
      .header {
        font-weight: 500;
        width: 10rem;
        margin-right: 2rem;
      }
    }
  }
}
</style>