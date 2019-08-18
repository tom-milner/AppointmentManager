<template>
  <div class="wrapper">
    <h2 class="heading-2">{{appointment.title}}</h2>

    <ul class="appointment-details">
      <li class="appointment-details-row">
        <icon class="icon" name="user"></icon>
        <h4 class="heading-4">{{counsellor.firstname}} {{counsellor.lastname}}</h4>
      </li>
      <li class="appointment-details-row">
        <icon class="icon" name="clock"></icon>
        <h4 class="heading-4">{{getFormattedStartTime}}</h4>
      </li>
      <li class="appointment-details-row">
        <icon class="icon" name="calendar"></icon>
        <h4 class="heading-4">{{getFormattedDate}}</h4>
      </li>
      <li class="appointment-details-row">
        <icon class="icon" name="check"></icon>
        <h4 class="heading-4" :class="getApprovalColor">{{getApprovalStatus}}</h4>
      </li>
      <li class="appointment-details">
        <h4 class="heading-4">Your Notes:</h4>
        <textarea disabled class="form-input" v-model="appointment.clientNotes"></textarea>
      </li>
      <li class="appointment-details attendance">
        <h4 class="heading-4">Can you attend?</h4>
        <button
          @click="setClientAttendance(true)"
          class="primary-btn"
          :class="{checked: appointment.clientCanAttend}"
        >Yes</button>
        <button
          @click="setClientAttendance(false)"
          class="primary-btn"
          :class="{checked: !appointment.clientCanAttend}"
        >No</button>
      </li>
    </ul>
  </div>
</template>

<script>
import Icon from "vue-icon/lib/vue-feather.esm";
import UserService from "@/services/UserService";
import AppointmentService from "@/services/AppointmentService";
export default {
  props: {
    appointment: {}
  },
  computed: {
    getFormattedStartTime: function() {
      return this.moment(this.appointment.startTime).format("LT");
    },
    getFormattedDate: function() {
      return this.moment(this.appointment.startTime).format("LL");
    },
    getApprovalStatus: function() {
      console.log(this.appointment.isApproved);
      return this.appointment.isApproved ? "Approved" : "Pending";
    },
    getApprovalColor: function() {
      return this.appointment.isApproved ? "approved" : "pending";
    }
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
    setClientAttendance(canAttend) {
      if (this.appointment.clientCanAttend != canAttend) {
        this.appointment.clientCanAttend = canAttend;
        AppointmentService.updateAppointment({
          appointmentProperties: {
            clientCanAttend: canAttend
          },
          appointmentId: this.appointment._id
        });
      }
    },

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
    justify-content: flex-start;

    // make sure there isn't any unnecessary margin
    &:not(:last-child) {
      margin-bottom: 2rem;
    }

    .icon {
      width: 2.4rem;
      height: 2.4rem;
      margin-right: 2rem;
    }

    .approved {
      color: $color-approved;
    }

    .pending {
      color: $color-error;
    }
  }

  textarea {
    resize: none;
    height: 20rem;
  }

  .attendance {
    h4 {
      display: inline;
      margin-right: 4rem;
    }
    button {
      &:not(:last-child) {
        margin-right: 3rem;
      }
    }
  }
}
</style>
