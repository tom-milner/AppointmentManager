<template>
  <div class="wrapper">
    <!-- Heading-->
    <h2 class="heading-2">User Details</h2>

    <ul class="user-details">
      <!-- Client name -->
      <li class="user-details-row">
        <h4 class="heading-4 header">Name:</h4>
        <h4 class="heading-4">{{fullClient.firstname}} {{fullClient.lastname}}</h4>
      </li>
      <li class="user-details-row">
        <h4 class="heading-4 header">Username:</h4>
        <h4 class="heading-4">{{fullClient.username}}</h4>
      </li>
      <li class="user-details-row">
        <h4 class="heading-4 header">Email:</h4>
        <h4 class="heading-4">{{fullClient.email}}</h4>
      </li>

      <!-- Clinical Notes -->
      <li class="section">
        <h4 class="heading-4">Clinical Notes</h4>
        <textarea class="clinical-notes form-input" v-model="fullClient.clinicalNotes"></textarea>
      </li>

      <!-- Error Message -->
      <li class="section" v-if="message.length > 0">
        <h4 class="heading-4 error" :class="{success: requestSuccessful }">{{message}}</h4>
      </li>
      <li class="section save-button">
        <button @click="saveClinicalNotes" class="btn btn-primary">Save Clinical Notes</button>
      </li>
    </ul>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import Utils from "@/utils";
export default {
  props: {
    client: {}
  },
  data() {
    return {
      fullClient: {},
      message: "",
      requestSuccessful: false
    };
  },
  components: {},
  async mounted() {
    let response = await UserService.getClient(this.client._id);
    this.fullClient = response.data.client;
  },
  methods: {
    async saveClinicalNotes() {
      try {
        let response = await UserService.updateClient(this.fullClient._id, {
          clinicalNotes: this.fullClient.clinicalNotes
        });
        this.requestSuccessful = response.data.success;
        if (!this.requestSuccessful) throw response;
        this.message = response.data.message;
      } catch (error) {
        if (Utils.isString(error)) this.message = error;
        else this.message = error.data.message;
      }
    }
  }
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
      margin-top: 1rem;

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

  .section {
    margin-top: 2rem;

    .clinical-notes {
      height: 30rem;
      resize: none;
    }
  }
}
</style>