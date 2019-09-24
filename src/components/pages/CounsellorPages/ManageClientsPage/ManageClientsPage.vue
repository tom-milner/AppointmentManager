<template>
  <div class="wrapper">
    <h2 class="heading-2">Manage Clients</h2>

    <!-- Options Bar -->
    <div class="container options">
      <div class="search">
        <h4 class="heading-4">Search:</h4>
        <input type="text" v-model="searchQuery" class="form-input search-box" />
      </div>
      <div>
        <h4 class="heading-4">Sort:</h4>
        <select v-model="sortKey" class="form-input select">
          <option>Firstname</option>
          <option>Lastname</option>
          <option>Username</option>
        </select>
      </div>
    </div>
    <!-- List of clients -->
    <div class="container">
      <ul class="client-list">
        <li class="client-item" v-for="client in getFilteredClients" :key="client._id">
          <ClientContainer :client="client"></ClientContainer>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import ClientContainer from "@/components/pages/CounsellorPages/ManageClientsPage/ClientContainer.vue";
export default {
  data() {
    return {
      allClients: [],

      sortKey: "Firstname",
      searchQuery: ""
    };
  },
  components: {
    ClientContainer
  },
  mounted() {
    this.getAllClients();
  },
  computed: {
    getFilteredClients() {
      let query = this.searchQuery.toUpperCase();
      let sortKey = this.sortKey.toLowerCase();
      let filteredClients = [];
      this.allClients.forEach((client, index) => {
        if (client[sortKey].toUpperCase().indexOf(query) > -1) {
          filteredClients.push(client);
        }
      });

      return filteredClients;
    }
  },
  watch: {
    sortKey() {
      this.sortClientsAlphabetically();
    }
  },
  methods: {
    async getAllClients() {
      try {
        let response = await UserService.getAllClients();
        console.log(response);
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
</style>