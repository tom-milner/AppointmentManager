<template>
  <div class="appointment-type-wrapper">
    <div class="row">
      <!-- If the user is not currently editing  -->
      <div class="inline" v-if="!isEditable">
        <h4 class="heading-4">{{appointmentType.name}}</h4>
        <h4 class="heading-4">
          <span>{{appointmentType.duration}}</span>
          <span class="small">mins</span>
        </h4>
      </div>

      <!-- Turn h4 into input field so user can edit -->
      <div class="inline" v-if="isEditable">
        <input
          :maxlength="maxNameLength"
          type="text"
          v-model="appointmentType.name"
          class="form-input heading-4 header-input"
        />
        <input
          type="number"
          v-model="appointmentType.duration"
          class="form-input heading-4 number-input header-input"
          :max="maxDuration"
          :min="minDuration"
        />
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage.length > 0">
        <h4 class="heading-4 error">{{errorMessage}}</h4>
      </div>

      <div class="right">
        <!-- Dropdown Icon -->
        <div @click="showFullAppointmentType" class="icon-box">
          <Icon v-if="!showFullType" class="edit" name="chevron-down"></Icon>
          <Icon v-else class="edit" name="chevron-up"></Icon>
        </div>

        <!-- Edit Button -->
        <div v-if="!isEditable && userCanEdit" @click="toggleIsEditable" class="icon-box">
          <Icon class="icon" name="edit" />
        </div>

        <!-- Save Button -->
        <button @click="saveAppointmentType" v-if="isEditable" class="btn btn-primary">Save</button>
      </div>
    </div>
    <!-- The extended appointment type -->
    <div v-if="showFullType">
      <!-- Appointment Type Description -->
      <div class="description" v-if="appointmentType.description  || isEditable">
        <h4 class="form-heading dropdown-heading">Description:</h4>
        <textarea
          :disabled="!isEditable"
          class="dropdown-info form-input"
          v-model="appointmentType.description"
          :maxlength="maxDescriptionLength"
        ></textarea>
      </div>

      <!-- IsRecurring -->
      <div class="recurring">
        <h4 class="form-heading dropdown-heading">Recurring Appointment:</h4>
        <p v-if="!isEditable" class="dropdown-info">{{isRecurringText}}</p>
        <button
          @click="toggleIsRecurring"
          class="btn checked"
          :class="getRecurringButtonClass"
          v-else
        >{{isRecurringText}}</button>
        <div class="recurring-duration" v-if="appointmentType.isRecurring">
          <input
            v-if="isEditable"
            v-model="appointmentType.recurringDuration"
            type="number"
            class="form-input number-input"
          />

          <p class="paragraph">
            <span v-if="!isEditable" class="paragraph">{{appointmentType.recurringDuration}}</span> weeks.
          </p>
        </div>
      </div>

      <!-- Delete appointment type -->
      <button
        @click="showDeleteDialogue = true"
        class="btn btn-disapproved delete-button"
        v-if="isEditable"
      >Delete</button>
    </div>

    <!-- Delete Dialogue -->
    <Dialogue @close-dialogue="showDeleteDialogue = false" v-if="showDeleteDialogue">
      <div class="dialogue-content">
        <h4 class="heading-4">
          Are you sure you want to delete the appointment type
          <span>{{appointmentType.name}}</span> ?
        </h4>
        <h4 class="heading-4">(The appointment type will remain unchanged on existing appointments)</h4>
        <div class="dialogue-row">
          <button @click="deleteAppointmentType" class="btn btn-disapproved">Yes</button>
          <button @click="showDeleteDialogue = false" class="btn btn-approved">No</button>
        </div>
      </div>
    </Dialogue>
  </div>
</template>



<style lang="scss" scoped>
@import "src/scss/global";
.appointment-type-wrapper {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 2px;
  padding: 2rem;
  background-color: $color-grey-very-light;

  border-left: 4px solid $color-primary;
  position: relative;
  transition: all 0.2s;
  width: 50rem;
  min-height: 6rem;
  display: inline-block;

  .row {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
    display: inline-block;
    width: 100%;
    input {
      height: 3rem;
      font-size: 2rem;
      padding-left: 0.5rem;
      width: auto;
      display: inline-block;

      &:not(:last-child) {
        margin-right: 2rem;
      }
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

      &:not(:last-child) {
        margin-right: 2rem;
      }

      &:hover {
        .icon {
          color: $color-primary;
        }
      }
      .icon {
        display: block;
        width: 2rem;
        height: 100%;
        color: $color-grey;
      }
    }
  }
}
.number-input {
  width: 5rem;
  padding-right: 1px;
}
.dropdown-heading {
  &:not(:first-child) {
    margin-top: 0.8rem;
  }
  color: $color-grey;
  font-weight: 500;
}

.dropdown-info {
  font-size: 1.5rem;
  font-weight: 300;
  display: inline;
}

textarea {
  resize: none;
  height: 10rem !important;
}

.delete-button {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
}

.dialogue-content {
  height: 100%;
  width: 30rem;
  text-align: center;

  h4 {
    span {
      color: $color-error;
    }
    &:not(:first-child) {
      margin-top: 0.5rem;
      font-size: 1.5rem;
      font-style: italic;
      color: $color-grey;
    }
  }
  .dialogue-row {
    margin-top: 3rem;
    display: flex;
    justify-content: space-around;
    width: 100%;
    button {
      width: 45%;
    }
  }
}

.right {
  float: right;
  // height: 100%;
}

.inline {
  display: inline-block;
  width: auto;
}

.recurring {
  vertical-align: center;

  button {
    display: inline-block;
    margin-right: 2rem;
    height: 3rem;
    padding: 0 2rem;
  }

  &-duration {
    display: inline-block;
    height: 3rem;
    margin-left: 1rem;
    input {
      // margin-top: 5rem;
      display: inline-block;
      height: 1.5rem;
      font-size: 1.5rem;
      margin-right: 0.5rem;
      padding: 1.5rem 0 1.5rem 0.5rem;
    }
    p {
      display: inline;
      font-size: 1.5rem;
    }
  }
}
</style>



<script>
import Icon from "vue-icon/lib/vue-feather.esm";
import AppointmentTypeService from "@/services/AppointmentTypeService";
import Dialogue from "@/components/layout/DialogueBox";

export default {
  data() {
    return {
      isEditable: false,
      errorMessage: "",
      maxNameLength: 20,
      maxDescriptionLength: 200,
      maxDuration: 120,
      minDuration: 5,
      showFullType: false,
      showDeleteDialogue: false,
      appointmentType: {}
    };
  },
  components: {
    Icon,
    Dialogue
  },
  props: {
    type: {},
    userCanEdit: Boolean
  },
  computed: {
    getRecurringButtonClass() {
      return {
        "btn-approved ": this.appointmentType.isRecurring,
        "btn-disapproved ": !this.appointmentType.isRecurring
      };
    },
    isRecurringText() {
      return this.appointmentType.isRecurring ? "Yes" : "No";
    }
  },
  beforeMount() {
    // assign to data to avoid mutating props
    this.appointmentType = this.type;
    if (!this.appointmentType._id) {
      this.isEditable = true;
    }
  },

  methods: {
    // sends request to delete appointment
    async deleteAppointmentType() {
      // send delete request
      await AppointmentTypeService.deleteAppointmentType(
        this.appointmentType._id
      );
      // refresh appointments
      this.$emit("refresh-appointments");
    },

    toggleIsRecurring() {
      this.appointmentType.isRecurring = !this.appointmentType.isRecurring;
    },
    showFullAppointmentType() {
      this.showFullType = !this.showFullType;
    },

    // Convert minutes to hours.
    minsToHours(mins) {
      return Math.round((mins / 60) * 10) / 10;
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
        } minutes (${this.minsToHours(this.maxDuration)} hours)`;
        return false;
      }

      return true;
    },

    // change whether the user can edit the appointment type.
    toggleIsEditable() {
      if (this.userCanEdit) {
        this.isEditable = !this.isEditable;
      }
    },

    async updateAppointmentType() {
      // load relevant properties into new object.
      let newProperties = {};
      newProperties.name = this.appointmentType.name;
      newProperties.duration = this.appointmentType.duration;
      newProperties.isRecurring = this.appointmentType.isRecurring;
      newProperties.recurringDuration = this.appointmentType.recurringDuration;
      newProperties.description = this.appointmentType.description;

      // send a request to the api to update the appointment type.
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
      } catch (error) {
        this.errorMessage = error.response.data.message;
        this.isEditable = true;
      }
    },

    async createAppointmentType() {
      try {
        let response = await AppointmentTypeService.createAppointmentType(
          this.appointmentType
        );
        if (!response.data.success) {
          throw {
            response
          };
        }
        this.$emit("refresh-appointments");
        // reset variables
        this.isEditable = false;
      } catch (error) {
        this.errorMessage = error.response.data.message;
        this.isEditable = true;
      }
    },

    // save the appointment
    async saveAppointmentType() {
      // validate the user entered data.
      let isValid = this.validateData();
      if (!isValid) {
        this.isEditable = true;
        return;
      }

      // check to see if the appointment is new.
      if (!this.appointmentType._id) {
        this.createAppointmentType();
      } else {
        // update appointment type
        this.updateAppointmentType();
      }
    }
  }
};
</script>