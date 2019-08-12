<template>
  <div class="wrapper">
    <h2 class="heading-2">{{appointment.title}}</h2>

    <ul class="appointment-details">
      <li class="appointment-details-row">
        <icon class="icon" name="user"></icon>
        <p class="text">{{counsellor.firstname}}</p>
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
  data() {
    return {
      clients: [],
      counsellor: {}
    };
  },
  components: {
    Icon
  },
  mounted() {
    this.getAllClients();
    this.getCounsellor();
  },
  methods: {
    getAllClients: async function() {
      let clientIds = this.appointment.clients;
      let clientIdsString = "";
      clientIds.forEach(id => {
        clientIdsString = clientIdsString.concat(id, ",");
      });
      let result = await UserService.getUsersFromIds(clientIdsString);
      this.clients = result.data.clients;
    },

    getCounsellor: async function() {
      let counsellorId = this.appointment.counsellorId;
      let result = await UserService.getUsersFromIds(counsellorId);
      this.counsellor = result.data.users[0];
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

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
      font-size: 1.5rem;
      font-weight: 300;
    }
  }
}
</style>
