<template>
  <div class="wrapper">
    <!-- title -->
    <h2 class="heading-2">{{appointment.title}}</h2>

    <!-- Counsellor Icon -->
    <ul class="appointment-details">
      <li class="appointment-details-row">
        <icon class="icon" name="user"></icon>
        <h4 class="heading-4">{{counsellor.firstname}} {{counsellor.lastname}}</h4>
      </li>

      <!-- Client Icon -->
      <li class="appointment-details-row">
        <icon class="icon" name="users"></icon>
        <h4
          v-for="client in clients"
          :key="client._id"
          class="heading-4"
        >{{client.firstname}} {{client.lastname}}</h4>
      </li>

      <!-- Start Time -->
      <li class="appointment-details-row">
        <icon class="icon" name="clock"></icon>
        <h4 class="heading-4">{{getFormattedStartTime}}</h4>
      </li>

      <!-- Date -->
      <li class="appointment-details-row">
        <icon class="icon" name="calendar"></icon>
        <h4 class="heading-4">{{getFormattedDate}}</h4>
      </li>

      <!-- Appointment Approval Status -->
      <li class="appointment-details-row">
        <icon class="icon" name="check"></icon>
        <h4 class="heading-4" :class="getApprovalColor">{{getApprovalStatus}}</h4>
      </li>

      <!-- Cient Notes -->
      <li class="appointment-details notes">
        <h4 class="heading-4">Client Notes (for counsellor to see) :</h4>
        <textarea :disabled="isCounsellor" class="form-input" v-model="appointment.clientNotes"></textarea>
        <button @click="saveNotes(false)" v-if="!isCounsellor" class="btn btn-secondary">Save</button>
      </li>

      <!-- Counsellor Notes -->
      <li v-if="isCounsellor" class="appointment-details notes">
        <h4 class="heading-4">(private) Counsellor Notes:</h4>
        <textarea
          :disabled="!isCounsellor"
          class="form-input"
          v-model="appointment.counsellorNotes"
        ></textarea>
        <button @click="saveNotes(true)" v-if="isCounsellor" class="btn btn-secondary">Save</button>
      </li>

      <!-- Client Attendence Buttons -->
      <li class="appointment-details attendance">
        <h4 class="heading-4">Can client attend?</h4>
        <button
          @click="setClientAttendance(true)"
          class="btn btn-primary"
          :class="{checked: appointment.clientCanAttend}"
        >Yes</button>
        <button
          @click="setClientAttendance(false)"
          class="btn btn-primary"
          :class="{checked: !appointment.clientCanAttend}"
        >No</button>
      </li>

      <!-- Counsellor Approval Buttons -->
      <li v-if="isCounsellor" class="appointment-details attendance">
        <h4 class="heading-4">Appointment Approval</h4>
        <button
          @click="setCounsellorApproval(true)"
          class="btn btn-primary"
          :class="{checked: appointment.isApproved}"
        >Approved</button>
        <button
          @click="setCounsellorApproval(false)"
          class="btn btn-primary"
          :class="{checked: !appointment.isApproved}"
        >Not Approved</button>
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
    appointment: {},
    isCounsellor: Boolean
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
    this.getClientsNames();
    this.getCounsellorName();
  },
  methods: {
    setClientAttendance(canAttend) {
      if (this.appointment.clientCanAttend != canAttend) {
        this.appointment.clientCanAttend = canAttend;
        let appointmentId = this.appointment._id;
        try {
          AppointmentService.updateAppointment(
            {
              clientCanAttend: canAttend
            },
            appointmentId
          );
        } catch (error) {
          console.log(error);
        }
      }
    },
    setCounsellorApproval(isApproved) {
      if (this.appointment.isApproved != isApproved) {
        this.appointment.isApproved = isApproved;
        try {
          AppointmentService.updateAppointment(
            {
              isApproved: isApproved
            },
            this.appointment._id
          );
        } catch (error) {
          console.log(error);
        }
      }
    },

    saveNotes(areCounsellorNotes) {
      // dynamically create properties object
      let appointmentProperties = {};
      if (areCounsellorNotes) {
        appointmentProperties.counsellorNotes = this.appointment.counsellorNotes;
      } else {
        appointmentProperties.clientNotes = this.appointment.clientNotes;
      }
      let appointmentId = this.appointment._id;

      try {
        AppointmentService.updateAppointment(
          appointmentProperties,
          appointmentId
        );
      } catch (error) {
        console.log(error);
      }
    },

    getClientsNames: async function() {
      let clientIds = this.appointment.clients;
      let clientIdsString = "";
      clientIds.forEach(id => {
        clientIdsString = clientIdsString.concat(id, ",");
      });

      let result = await UserService.getUsersFromIds(clientIdsString);

      this.clients = result.data.users;
      console.log(this.clients);
    },

    getCounsellorName: async function() {
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

  .notes {
    position: relative;

    button {
      position: absolute;
      bottom: 0;
      right: 0;
      margin: 1rem 0.6rem;
    }
  }
  &-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;

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
