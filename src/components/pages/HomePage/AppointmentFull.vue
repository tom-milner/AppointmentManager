<template>
  <div class="wrapper">
    <h2 class="heading-2">{{appointment.title}}</h2>

    <ul class="appointment-details">
      <li class="appointment-details-row">
        <icon class="icon" name="user"></icon>
        <!-- <p v-for="client in appointment.clients" v-bind:key="appoint" class="text">{{client}}</p> -->
      </li>
      <li class="appointment-details-row">
        <icon class="icon" name="map-pin"></icon>
        <p class="text">{{appointment.location}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import Icon from "vue-icon/lib/vue-feather.esm";
import UserService from "@/services/UserService";
export default {
  props: {
    appointment: {}
  },
  components: {
    Icon
  },
  mounted() {
    this.getAllClients();
  },
  methods: {
    getAllClients: async function() {
      let clientIds = this.appointment.clients;
      console.log(clientIds);
      let clientIdsString = "";
      clientIds.forEach(id => {
        clientIdsString = clientIdsString.concat(id, ",");
      });
      console.log(clientIdsString);
      let result = await UserService.getUsersFromIds(clientIdsString);
      console.log(result);
      // get all the clients involved in the appointment
    }
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
  &-row {
    display: flex;
    align-items: center;

    // make sure there isn't any unnecessary margin
    &:not(:last-child) {
      margin-bottom: 2rem;
    }

    .icon {
      width: 2.4rem;
      height: 2.4rem;
      margin-right: 4rem;
    }

    .text {
    }
  }
}
</style>
