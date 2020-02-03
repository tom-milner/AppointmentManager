<template>
  <div
    @click="!isEditable ? toggleShowFullAppointmentType() : null"
    class="appointment-type-wrapper"
    :style="getBorder"
  >
    <div class="row">
      <!-- If the user is not currently editing  -->
      <div class="inline" v-if="!isEditable">
        <h4 class="heading-4">{{ appointmentType.name }}</h4>
        <h4 class="heading-4">
          <span>{{ appointmentType.duration }}</span>
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

      <div class="right">
        <!-- Dropdown icon -->
        <div v-if="!forceOpen" class="icon-box">
          <icon v-if="!showFullType" class="edit" name="chevron-down"></icon>
          <icon v-else class="edit" name="chevron-up"></icon>
        </div>

        <!-- Edit Button -->
        <div v-if="!isEditable && userCanEdit" @click="toggleIsEditable" class="icon-box">
          <icon class="icon" name="edit" />
        </div>

        <!-- Save Button -->
        <button v-if="isEditable" class="btn btn-primary" @click="saveAppointmentType">Save</button>
      </div>
      <!-- Error Message -->
      <div v-if="errorMessage.length > 0">
        <h4 class="heading-4 error">{{ errorMessage }}</h4>
      </div>
    </div>
    <!-- The extended appointment type -->
    <div v-if="showFullType">
      <!-- Appointment Type Description -->
      <div class="description" v-if="appointmentType.description || isEditable">
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
        <p v-if="!isEditable" class="dropdown-info">{{ isRecurringText }}</p>
        <button @click="toggleIsRecurring" class="btn checked" :class="getRecurringButtonClass" v-else>
          {{ isRecurringText }}
        </button>
        <div class="recurring-duration" v-if="appointmentType.isRecurring">
          <input
            v-if="isEditable"
            v-model="appointmentType.recurringDuration"
            type="number"
            class="form-input number-input"
            max="10"
            min="2"
          />

          <p class="paragraph">
            <span v-if="!isEditable" class="paragraph">{{ appointmentType.recurringDuration }}</span> weeks.
          </p>
        </div>
      </div>

      <div v-if="isEditable" class="bottom-row">
        <div>
          <h4 class="form-heading dropdown-heading">Color:</h4>
          <ColorPicker v-model="appointmentType.color" :colors="appointmentTypeColours"></ColorPicker>
        </div>
        <!-- Delete appointment type -->
        <button @click="showDeleteDialogue = true" class="btn btn-disapproved delete-button">Delete</button>
      </div>
    </div>

    <!-- Delete Dialogue -->
    <Dialogue @close-dialogue="showDeleteDialogue = false" v-if="showDeleteDialogue">
      <div class="dialogue-content">
        <h4 class="heading-4">
          Are you sure you want to delete the appointment type
          <span>{{ appointmentType.name }}</span> ?
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

<script>
import AppointmentTypeService from "@/services/AppointmentTypeService";
import Dialogue from "@/components/layout/DialogueBox";
import ColorPicker from "@/components/misc/ColorPicker";

export default {
  data() {
    return {
      isEditable: false, // Whether the appointment type is in edit mode or not.
      errorMessage: "", // The error message.
      maxNameLength: 20, // The maximum name length.
      maxDescriptionLength: 500, // The maximum number of characters for the description.
      maxDuration: 120, // The maximum duration for an appointment type.
      minDuration: 50, // The minimum duraiton for an appointment type.
      showFullType: false, // Whether to show the full appointment type information or not.
      showDeleteDialogue: false, // Whether to show the 'Delete Appointment Type' dialogue or not.
      appointmentType: {}, // The appointment type information.
      appointmentTypeColours: [
        // The colors an appointment type can be.
        "#3398d3",
        "#65ca35",
        "#2300ED",
        "#f44336",
        "#fcba03",
        "#E91E63",
        "#2196F3",
        "#607D8B"
      ]
    };
  },
  components: {
    ColorPicker,
    Dialogue
  },
  props: {
    type: {}, // The provided appointment type. This is passed to a data property (appointmentType) instantly.
    userCanEdit: Boolean, // Whether the user is allowed to edit the appointment or not.
    forceOpen: Boolean // If true, the appointment type will be forced to remain open (show full appointment type open).
  },
  computed: {
    // Render the border of the appointment type container depending on the color stored in the database.
    getBorder() {
      return {
        "border-left": `5px solid ${this.appointmentType.color} !important`
      };
    },
    // Supply different CSS classes to the 'Recurring' button depending on the recurring status of the appointment type.
    getRecurringButtonClass() {
      return {
        "btn-approved ": this.appointmentType.isRecurring,
        "btn-disapproved ": !this.appointmentType.isRecurring
      };
    },

    // Display 'Yes' or 'No' instead of 'True' or 'False'
    isRecurringText() {
      return this.appointmentType.isRecurring ? "Yes:" : "No";
    }
  },
  beforeMount() {
    // Copy the appointment type prop to data to avoid mutating the prop, as the prop is overwritten.
    this.appointmentType = this.type;

    // If the appointment type is new (not in the database), set some default variables.
    if (!this.appointmentType._id) {
      this.isEditable = true; // Make the appointment type editable.

      // Generate a random integer to use to choose a random color.
      const randomInt = Math.round(Math.random() * this.appointmentTypeColours.length);
      this.appointmentType.color = this.appointmentTypeColours[randomInt];
    }
    // If the forceOpen prop was specified, open the appointment type.
    this.showFullType = this.forceOpen;
  },

  methods: {
    // Sends request to delete appointment
    async deleteAppointmentType() {
      // Send delete request
      if (this.appointmentType._id)
        try {
          await AppointmentTypeService.deleteAppointmentType(this.appointmentType._id);
        } catch (error) {
          this.errorMessage = error.response.data.message;
        }
      // Refresh appointments
      this.$emit("refresh-appointments");
    },

    // Change the recurring status of the appointment.
    toggleIsRecurring() {
      this.appointmentType.isRecurring = !this.appointmentType.isRecurring;
    },

    // Toggle the full appointment view.
    toggleShowFullAppointmentType() {
      this.showFullType = !this.showFullType;
    },

    // Convert minutes to hours.
    minsToHours(mins) {
      return Math.round((mins / 60) * 10) / 10;
    },

    // Validate all user input
    validateData() {
      let name = this.appointmentType.name;
      let duration = this.appointmentType.duration;

      // check name
      if (name.length > this.maxNameLength) {
        this.errorMessage = `Name must be below ${this.maxNameLength} characters.`;
        return false;
      }

      if (name.length < 1) {
        this.errorMessage = "Invalid appointment type name.";
        return false;
      }

      // check duration
      if (duration < this.minDuration || duration > this.maxDuration) {
        // Find whether the appointment type duration is too large or too small, and return an error.
        let isMin = duration < this.minDuration;
        let violatedDuration = isMin ? this.minDuration : this.maxDuration;
        this.errorMessage = `${isMin ? "Min" : "Max"} duration is ${violatedDuration} minutes (${this.minsToHours(
          violatedDuration
        )} hours)`;
        return false;
      }

      // All data is valid.
      return true;
    },

    // Change whether the user can edit the appointment type.
    toggleIsEditable() {
      // only if the user is allowed to edit the appointment type.
      if (this.userCanEdit) {
        this.isEditable = !this.isEditable;

        // This opens the appointment type if edit mode is turned on, but makes sure it doesn't close once edit mode is turned off.
        if (this.isEditable) this.showFullType = true;
      }
    },

    // Update a preexisting appointment type.
    async updateAppointmentType() {
      // Send request
      let response = await AppointmentTypeService.updateAppointmentType(this.appointmentType._id, this.appointmentType);
      // Check for error.
      if (!response.data.success) {
        throw { response };
      }
    },

    // Create a new appointment type.
    async createAppointmentType() {
      let response = await AppointmentTypeService.createAppointmentType(this.appointmentType);
      if (!response.data.success) {
        throw {
          response
        };
      }
      // Refresh the appointments to load the created appointment type.
      this.$emit("refresh-appointments");
    },

    // Save the appointment
    async saveAppointmentType() {
      // Validate the user entered data.
      let isValid = this.validateData();
      if (!isValid) {
        this.isEditable = true;
        return;
      }

      try {
        // If the appointment is new, create it.
        if (!this.appointmentType._id) {
          await this.createAppointmentType();
        } else {
          // Else update the existing appointment type.
          await this.updateAppointmentType();
        }

        // Close edit mode.
        this.isEditable = false;
        this.errorMessage = "";
      } catch (error) {
        this.errorMessage = error.response.data.message;
      }
    }
  }
};
</script>

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
  width: 60rem;
  max-width: 100%;
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
  margin-top: 1.5rem;
  button {
    display: inline-block;
    margin-right: 2rem;
    height: 3rem;
    padding: 0 2rem;
  }

  &-duration {
    display: inline-block;
    height: 3rem;
    margin-left: 0.5rem;
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

.bottom-row {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .delete-button {
    margin-bottom: 0.2rem;
  }
}
</style>
