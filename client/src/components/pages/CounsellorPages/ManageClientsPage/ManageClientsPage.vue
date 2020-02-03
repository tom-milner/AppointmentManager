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
          <option v-for="key in getClientKeys" :key="key">{{ key }}</option>
        </select>
      </div>
    </div>

    <h4 class="heading-4 error">{{ message.content }}</h4>

    <!-- List of clients -->
    <div class="container">
      <ul class="client-list">
        <router-link v-for="client in getFilteredClients" :key="client._id" :to="getClientUrl(client)">
          <li class="client-item">
            <div class="client-content">
              <h4 class="heading-4 fullname">{{ client.firstname }} {{ client.lastname }}</h4>
              <p>{{ client.username }}</p>
              <p>{{ client.email }}</p>
            </div>
          </li>
        </router-link>
      </ul>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
export default {
  data() {
    return {
      allClients: [], // All the clients in the database.
      sortKey: "Firstname", // The key to sort the clients with.
      searchQuery: "", // The query to search the clients with.
      message: {
        content: "", // The message contents.
        success: false // Whether the message is an error or success message.
      }
    };
  },
  mounted() {
    this.getAllClients(); // Fetch all the clients when the page loads.
  },
  computed: {
    // Filter the clients using the search query.
    getFilteredClients() {
      if (this.allClients.length < 1) return [];
      // create local copies of variables - you can't use "this" in  a forEach
      let query = this.searchQuery.toLowerCase();
      let filteredClients = [];

      // create new array of filtered clients.
      for (let client of this.allClients) {
        for (let key of this.getClientKeys) {
          if (client[key.toLowerCase()].toLowerCase().includes(query)) {
            filteredClients.push(client);
            break;
          }
        }
      }

      return filteredClients;
    },

    // The keys that can be used to sort the clients with.
    getClientKeys() {
      return ["Username", "Firstname", "Lastname", "Email"];
    }
  },
  watch: {
    // When the sort key changes, resort the clients.
    sortKey() {
      this.sortClientsAlphabetically();
    }
  },
  methods: {
    // Get the url of the clients user details page.
    getClientUrl(client) {
      return `clients/${client._id}`;
    },

    // Get all the clients on the system.
    async getAllClients() {
      try {
        let response = await UserService.getAllClients();
        this.allClients = response.data.clients;
        this.sortClientsAlphabetically();
      } catch (error) {
        this.message.content = error.response.data.message || "Error fetching clients.";
        this.message.success = false;
      }
    },

    // Sort the clients alphabetically.
    sortClientsAlphabetically() {
      const sortKey = this.sortKey.toLowerCase();
      this.allClients.sort((client, nextClient) => {
        const clientName = client[sortKey].toLowerCase();
        const nextClientName = nextClient[sortKey].toLowerCase();
        // Javascript will automatically compare the strings alphabetically.
        if (clientName < nextClientName) return -1;
        if (clientName > nextClientName) return 1;
        return 0;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.container {
  margin-top: 2rem;
}

.client-list {
  list-style: none;
  width: 75rem;

  .client-item {
    border-radius: 2px;
    padding: 1rem 2rem;
    background-color: $color-canvas;

    padding-right: 5rem;
    border-left: 4px solid $color-primary;
    position: relative;
    transition: all 0.2s;

    margin-bottom: 1rem;
    color: $color-black;

    .client-content {
      margin-left: 0.5rem;
      min-width: 50rem;

      h4 {
        display: inline-block;
        width: 15rem;
        font-weight: 300;
        margin-right: 5rem;
      }

      p {
        display: inline-block;
        min-width: 17rem;
        font-weight: 300;
        font-size: 1.5rem;
      }
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

.error {
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
