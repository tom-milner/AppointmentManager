<!--
  This file contains the Profile Page component.
  It allows the user to edit their details, and allows counsellors to share a booking link and add new counsellors.
-->

<template>
  <div class="wrapper">
    <div>
      <h2 class="heading-2">Your Profile</h2>
      <!-- For Counsellors Only -->
      <!-- Booking Link -->
      <div v-if="userIsCounsellor" class="container">
        <h3 class="heading-3">Your Booking Link</h3>
        <p class="paragraph"><span>Note:</span> Click to copy.</p>
        <h4 @click="copyToClipboard" class="heading-4 booking-link">{{ generateBookingLink() }}</h4>
        <h4 class="heading-4 success copy-message">Link Copied!</h4>
        <p class="paragraph info">
          Send this link to anyone that needs to book an appointment but doesn't have an account. It will create a guest
          account for them, which they can activate (turn into a real account) later.
        </p>
      </div>

      <!-- Their personal information -->
      <div class="container personal-info">
        <h3 class="heading-3">Personal Information</h3>
        <div class="icon-box" @click="toggleUserCanEdit">
          <icon name="edit" class="edit-icon"></icon>
        </div>
        <form v-on:submit.prevent="updateUserDetails" @click="userCanEdit ? null : toggleUserCanEdit()">
          <ul class="details">
            <li v-for="detail in getUserEditKeys" :key="detail">
              <h4 class="heading-4">{{ detail }}</h4>
              <input type="text" class="form-input" v-if="userCanEdit" v-model="user[detail.toLowerCase()]" />
              <h4 v-else class="heading-4">{{ user[detail.toLowerCase()] }}</h4>
            </li>
          </ul>
          <!--  Message -->
          <div class="response-message" v-if="messages.updateInfo.content.length > 0">
            <h4 class="heading-4" :class="messages.updateInfo.success ? 'success' : 'error'">
              {{ messages.updateInfo.content }}
            </h4>
          </div>
          <button v-if="userCanEdit" class="btn btn-secondary save-button">Save</button>
        </form>
      </div>

      <!--  For counsellors only -->
      <div v-if="userIsCounsellor" class="container create-counsellor">
        <h3 class="heading-3">Create a Counsellor</h3>
        <p class="paragraph info">
          This will send an email to the user that will enable them to change their account status to a counsellor.
        </p>
        <form v-on:submit.prevent="sendNewCounsellorEmail">
          <h4 class="form-heading">Enter email of new counsellor:</h4>
          <input class="form-input" type="email" v-model="newCounsellorEmail" />
          <h4 class="form-heading">Your password:</h4>
          <input class="form-input" type="password" v-model="createCounsellorPassword" />
          <div class="response-message" v-if="messages.createCounsellor.content.length > 0">
            <h4 class="heading-4" :class="messages.createCounsellor.success ? 'success' : 'error'">
              {{ messages.createCounsellor.content }}
            </h4>
          </div>
          <button class="btn btn-secondary send-button">Send Email</button>
        </form>
      </div>

      <!-- Send Forgot Password Email -->
      <div class="container reset-password">
        <button @click="sendResetPasswordEmail" class="btn btn-primary">{{ emailButtonContent }}</button>
        <p class="paragraph info">
          Pressing this button will send an email to your account containing a link to reset your password. If you
          ignore the email, your password will remain unchanged.
        </p>
      </div>

      <!-- Delete Button -->
      <div class="container delete-account">
        <button @click="showDeleteDialogue = true" class="btn btn-disapproved">Delete Your Account</button>
        <p class="paragraph info">This will remove all of your appointment from the system.</p>
        <h4 class="heading-4" :class="messages.delete.success ? 'success' : 'error'">
          {{ messages.delete.content }}
        </h4>
      </div>
    </div>

    <!-- Delete Dialogue -->
    <Dialogue @close-dialogue="showDeleteDialogue = false" v-if="showDeleteDialogue">
      <div class="dialogue-content">
        <h4 class="heading-4">Are you sure you want to delete this account?</h4>
        <div class="dialogue-row">
          <button @click="deleteUser" class="btn btn-disapproved">Yes</button>
          <button @click="showDeleteDialogue = false" class="btn btn-approved">No</button>
        </div>
      </div>
    </Dialogue>
  </div>
</template>

<script>
import Utils from "@/utils";
import UserService from "@/services/UserService";
import AuthenticationService from "@/services/AuthenticationService";
import UserAuthService from "@/services/UserAuthService";
import Dialogue from "@/components/layout/DialogueBox";

export default {
  components: {
    Dialogue
  },
  data() {
    return {
      user: {}, // The current user.
      userCanEdit: false, // Whether the user can edit their details.
      emailButtonContent: "Send Reset Password Email", // The message to display inside the email button.
      emailsLeft: 3, // The amount of tries the user has left.
      showDeleteDialogue: false, // Whether to show the 'Delete User' dialogue or not.
      newCounsellorEmail: "", // The email of the new counsellor.
      createCounsellorPassword: "", // The password to use to create the new counsellor.
      messages: {
        // The error/success messages.
        updateInfo: {
          content: "",
          success: false
        },
        createCounsellor: {
          content: "",
          success: false
        },
        delete: {
          content: "",
          success: false
        }
      }
    };
  },

  async beforeMount() {
    // Store the user locally.
    this.user = this.$store.state.authentication.user;
  },
  mounted() {
    // CSS for the booking link styling - make sure it doesn't animate until it's clicked.
    if (this.userIsCounsellor) document.querySelector(".copy-message").style.animation = "none";

    // Reset number of emails left every 3 minutes
    setTimeout(
      function() {
        this.emailsLeft = 3;
      }.bind(this),
      60000
    );
  },
  computed: {
    // Fetch whether the user is a counsellor or not from the store.
    userIsCounsellor: function() {
      return this.$store.getters["authentication/isCounsellor"];
    },
    // The fields that the user can edit.
    getUserEditKeys() {
      return ["Email", "Username", "Firstname", "Lastname"];
    }
  },
  methods: {
    // Send the specified new counsellor an email allowing them to create a counsellor account.
    async sendNewCounsellorEmail() {
      let response;
      try {
        response = await UserService.sendNewCounsellorEmail(this.newCounsellorEmail, this.createCounsellorPassword);
      } catch (error) {
        response = error.response;
      }
      this.messages.createCounsellor.content = response.data.message;
      this.messages.createCounsellor.success = response.data.success;
    },

    // Delete the user.
    async deleteUser() {
      try {
        await UserService.deleteUser(this.user._id);
        UserAuthService.logoutUser(); // This will automatically redirect the user.
      } catch (error) {
        this.messages.delete.content = error.response.data.message;
        this.messages.delete.success = false;
      }
    },

    // Send a reset password email to the user.
    async sendResetPasswordEmail() {
      if (this.emailsLeft < 1) {
        this.emailButtonContent = "You can only send 3 emails per minute.";
        return;
      }
      try {
        let response = await AuthenticationService.forgotPassword(this.user.email);
        this.emailButtonContent = response.data.message;
        this.emailsLeft--;
      } catch (error) {
        this.emailButtonContent = Utils.isString(error) ? error : error.response.data.message;
      }
    },

    // Toggle edit mode for the user details.
    toggleUserCanEdit() {
      this.userCanEdit = !this.userCanEdit;
      if (this.userCanEdit) {
        this.messages.updateInfo.content = ""; // Reset the message.
      }
    },

    // Update the user's details.
    async updateUserDetails() {
      let response;
      try {
        response = await UserService.updateUser(this.user._id, this.user, this.userIsCounsellor);
      } catch (error) {
        this.messages.updateInfo.success = false;
        this.messages.updateInfo.content = Utils.isString(error) ? error : error.response.data.message;
      }
      this.userCanEdit = false;

      // remove the message after 2 seconds
      setTimeout(
        function() {
          this.message = "";
        }.bind(this),
        2000
      );

      // reset the user object in the store.
      this.$store.commit("authentication/auth_success", {
        token: this.$store.state.authentication.token,
        user: this.user
      });

      this.messages.updateInfo.success = true;
      this.messages.updateInfo.content = response.data.message;
    },

    // Generate the counsellor's booking link
    generateBookingLink() {
      // The link is just '/auth/guest' followed by the counsellors ID in base64
      return `${window.location.origin}/auth/guest/${window.btoa(this.user._id)}`;
    },

    // Copy the booking link to the clipboard.
    copyToClipboard(event) {
      // Get the link from the HTML element.
      let link = event.target.innerText;

      // Trigger the 'link copied' message to animate.
      this.linkCopied = Utils.copyToClipboard(link, document);

      // CSS tweak for making the 'Link Copied' message animate correctly
      let copyMessage = document.querySelector(".copy-message");
      copyMessage.style.animation = "none";
      copyMessage.offsetHeight;
      copyMessage.style.animation = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.container {
  margin-top: 4rem;

  .copy-message {
    display: inline-block;
    margin-left: 1rem;
    transition: all 0.2s;
    opacity: 0;
    animation: 1s fadeOut ease-out;
    transform: translateY(0);
  }
  .booking-link {
    margin-top: 1rem;
    background-color: $color-canvas;
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 5px;
    transition: all 0.2s;

    &:hover {
      background-color: darken($color-canvas, 10%);
    }
  }
  .info {
    margin-top: 1rem;
    display: block;
    width: 55rem;
  }

  &.create-counsellor {
    h4 {
      margin-top: 0.5rem;
    }
    p {
      width: 41rem;
    }
    input {
      width: 30rem;
      //   vertical-align: middle;
      margin-bottom: 0;
      display: block;
    }
    .send-button {
      margin-top: 1rem;
    }
  }

  &.personal-info {
    .icon-box {
      // width: 100%;
      height: 100%;
      display: inline-block;
      margin-left: 1rem;

      color: $color-grey;
      &:hover .edit-icon {
        color: $color-primary;
      }
      .edit-icon {
        transition: all 0.2s;
        width: 2rem;
        height: 100%;
      }
    }
    h3 {
      display: inline;
    }

    .save-button {
      margin-top: 1rem;
    }

    .response-message {
      margin-top: 1rem;
    }

    .details {
      list-style: none;
      li {
        list-style: none;

        :first-child {
          width: 12rem;
          font-weight: 500;
        }
        h4 {
          margin-top: 0.5rem;
          display: inline-block;
        }

        .form-input {
          display: inline-block;
          width: 30rem;
          font-size: 1.75rem;
          font-weight: 300;
        }
      }
    }
  }

  &.reset-password {
    width: 100%;

    button {
      margin-top: 1rem;
      width: 25rem;
      display: inline-block;
      vertical-align: middle;
    }

    p {
      display: inline-block;
      vertical-align: middle;
      margin-left: 2rem;
    }
  }

  &.delete-account {
    width: 100%;
    button {
      width: 25rem;
      display: inline-block;
      vertical-align: middle;
    }

    p {
      display: inline;
      vertical-align: middle;
      margin-left: 2rem;
    }

    .error {
      margin-top: 0.5rem;
      width: 25rem;
    }
  }
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

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  70% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    display: none;
    transform: translateY(-0.5rem);
  }
}
</style>
