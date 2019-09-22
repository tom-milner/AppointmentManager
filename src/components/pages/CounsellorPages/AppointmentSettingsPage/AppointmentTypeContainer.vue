<template>
  <div class="wrapper">
    <!-- If the user is not currently editing  -->
    <div v-if="!isEditable">
      <h4 class="heading-4">{{appointmentType.name}}</h4>
      <h4 class="heading-4">
        <span class="big">{{appointmentType.duration}}</span>
        <span class="small">mins</span>
      </h4>
    </div>

    <!-- Turn h4 into input field so user can edit -->
    <div v-if="isEditable">
      <input
        :maxlength="maxNameLength"
        type="text"
        v-model="appointmentType.name"
        class="form-input heading-4"
      />
      <input
        type="number"
        v-model="appointmentType.duration"
        class="form-input heading-4 number-input"
        :max="maxDuration"
        :min="minDuration"
      />
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage.length > 0">
      <h4 class="heading-4 error">{{errorMessage}}</h4>
    </div>

    <!-- Edit/Save Button -->
    <div @click="toggleIsEditable" class="icon-box">
      <Icon v-if="!isEditable" class="icon" name="edit" />
    </div>
    <button @click="updateAppointmentType" v-if="isEditable" class="btn btn-secondary">Save</button>
  </div>
</template>


<script>
import Icon from "vue-icon/lib/vue-feather.esm";
import AppointmentTypeService from "@/services/AppointmentTypeService";

export default {
  data() {
    return {
      isEditable: false,
      errorMessage: "",
      maxNameLength: 20,
      maxDuration: 400,
      minDuration: 5
    };
  },
  components: {
    Icon
  },
  props: {
    appointmentType: {}
  },

  methods: {
    // Convert minutes to hours.
    minsToHours(mins) {
      return Math.floor(mins / 60);
    },

    // validate all user input
    validateData() {
      let name = this.appointmentType.name;
      let duration = this.appointmentType.duration;

      // check name
      if (name.length > this.maxNameLength) {
        this.errorMessage = `Name must be below ${this.maxNameLength} characters.`;
        return false;
      }

      // check duration
      if (duration < this.minDuration || duration > this.maxDuration) {
        this.errorMessage = `Max duration is ${
          this.maxDuration
        } minutes ( ~ ${this.minsToHours(this.maxDuration)} hours)`;
        return false;
      }

      return true;
    },

    // change whether the user can edit the appointment type.
    toggleIsEditable() {
      this.isEditable = !this.isEditable;
    },

    // send a request to the api to update the appointment type.
    async updateAppointmentType() {
      // validate the user entered data.
      let isValid = this.validateData();
      if (!isValid) {
        this.isEditable = true;
        return;
      }

      let newProperties = {};
      newProperties.name = this.appointmentType.name;
      newProperties.duration = this.appointmentType.duration;

      try {
        // send request
        let response = await AppointmentTypeService.updateAppointmentType(
          this.appointmentType._id,
          newProperties
        );
        // check for server error.
        if (!response.data.success) {
          throw { response };
        }

        // reset variables
        this.isEditable = false;
        this.errorMessage = "";
      } catch (error) {
        this.errorMessage = error.response.data.message;
      }
    },

    // send request to create new appointment type.
    createAppointmentType() {
      // validate the user entered data.
      let isValid = this.validateData();
      if (!isValid) {
        this.isEditable = true;
        return;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
.wrapper {
  box-shadow: -1px 2px 4px rgba($color-black, 0.5);
  border-radius: 2px;
  padding: 2rem;
  background-color: $color-grey-very-light;

  width: auto;
  display: inline-block;
  border-left: 4px solid $color-primary;

  transition: all 0.2s;

  :not(:last-child) {
    :not(span) {
      margin-right: 2rem;
    }
  }

  div {
    display: inline-block;

    input {
      // display: inline-block;
      height: 3rem;
      font-size: 2rem;
      padding: 0;
      width: auto;
      margin-right: 2rem;
    }

    .number-input {
      width: 5rem;
    }
    h4 {
      min-width: 12rem;
      margin-right: 2rem;
      display: inline-block;
      .small {
        font-size: 1.8rem;
        margin: none;
      }
    }
    .icon-box {
      display: inline-block;
      height: 100%;
      width: auto;
      &:hover {
        .icon {
          color: $color-primary;
        }
      }
      .icon {
        height: 2rem;
        // width: 2rem;
        color: $color-grey;
      }
    }
  }
}

.modal-content {
  width: 50rem;
}
</style>