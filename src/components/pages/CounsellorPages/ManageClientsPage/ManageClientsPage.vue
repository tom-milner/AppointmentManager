<template>
  <div class="wrapper">
    <h2 class="heading-2">Manage Clients</h2>

    <!-- Options Bar -->
    <div class="container options">
      <div class="search">
        <h4 class="heading-4">Search:</h4>
        <input type="text" v-model="searchQuery" class="form-input search-box" />
      </div>

      <!-- Sort bar -->
      <div>
        <h4 class="heading-4">Sort:</h4>
        <select v-model="sortKey" class="form-input select">
          <option v-for="key in getClientKeys" :key="key">{{key}}</option>
        </select>
      </div>
    </div>

    <!-- List of clients -->
    <div class="container">
      <h3 class="heading-3">Clients:</h3>
      <ul class="client-list">
        <li class="client-item" v-for="client in getFilteredClients" :key="client._id">
          <ClientContainer @click.native="viewClient(client)" :client="client">
            <div class="modal-content"></div>
          </ClientContainer>
        </li>
      </ul>
    </div>

    <!-- Modal -->
    <Modal v-on:close-modal="showViewClient=false" v-if="showViewClient">
      <div class="modal-content">
        <UserStats :client="chosenClient" />
      </div>
    </Modal>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import ClientContainer from "@/components/pages/CounsellorPages/ManageClientsPage/ClientContainer.vue";
import Modal from "@/components/layout/Modal";
import UserStats from "./UserStats";
export default {
  data() {
    return {
      allClients: [],
      sortKey: "Firstname",
      searchQuery: "",
      chosenClient: {},
      showViewClient: false
    };
  },
  components: {
    ClientContainer,
    Modal,
    UserStats
  },
  mounted() {
    this.getAllClients();
  },
  computed: {
    getFilteredClients() {
      // create local copies of variables - you can't use "this" in  a forEach
      let query = this.searchQuery.toLowerCase();
      let sortKey = this.sortKey.toLowerCase();
      let filteredClients = [];

      // create new array of filtered clients.
      this.allClients.forEach(client => {
        if (client[sortKey].toLowerCase().indexOf(query) > -1) {
          filteredClients.push(client);
        }
      });

      return filteredClients;
    },
    getClientKeys() {
      return ["Username", "Firstname", "Lastname"];
    }
  },
  watch: {
    sortKey() {
      this.sortClientsAlphabetically();
    }
  },
  methods: {
    viewClient(client) {
      this.chosenClient = client;
      this.showViewClient = true;
    },
    async getAllClients() {
      try {
        let response = await UserService.getAllClients();
        this.allClients = response.data.clients;
        this.sortClientsAlphabetically();
      } catch (error) {
        console.log(error);
      }
    },
    sortClientsAlphabetically() {
      const sortKey = this.sortKey.toLowerCase();
      this.allClients.sort(function(client, nextClient) {
        let clientName = client[sortKey].toUpperCase();
        let nextClientName = nextClient[sortKey].toUpperCase();

        if (clientName < nextClientName) return -1;
        if (clientName > nextClientName) return 1;
        return 0;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  margin-top: 2rem;
}

.client-list {
  list-style: none;

  .client-item {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}

.options {
  *:not(:last-child) {
    margin-right: 1rem;
  }

  h4 {
    display: inline-block;
    min-width: 6rem;
  }
  input {
    width: 30rem;
  }
  select {
    width: 30rem;
  }
}

.modal-content {
  width: 75rem;
}
</style>