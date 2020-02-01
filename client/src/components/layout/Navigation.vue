<template>
  <div>
    <div class="sidebar-wrapper">
      <ul class="navigation">
        <!-- TODO: create list of icons in js, then render them. -->
        <router-link to="/profile">
          <li class="nav-item">
            <icon name="user" class="nav-icon" />
            <h4 class="nav-heading">Profile</h4>
          </li>
        </router-link>

        <router-link to="/home">
          <li class="nav-item">
            <icon name="home" class="nav-icon" />
            <h4 class="nav-heading">Home</h4>
          </li>
        </router-link>

        <router-link to="/create">
          <li class="nav-item">
            <icon name="plus-square" class="nav-icon" />
            <h4 class="nav-heading">Book Appointment</h4>
          </li>
        </router-link>

        <div v-if="userIsCounsellor">
          <router-link to="/counsellor/calendar">
            <li class="nav-item">
              <icon name="clock" class="nav-icon" />
              <h4 class="nav-heading">Work Times</h4>
            </li>
          </router-link>
          <router-link to="/counsellor/appointment-settings">
            <li class="nav-item">
              <icon name="settings" class="nav-icon" />
              <h4 class="nav-heading">Appointment Types</h4>
            </li>
          </router-link>
          <router-link to="/counsellor/clients">
            <li class="nav-item">
              <icon name="users" class="nav-icon" />
              <h4 class="nav-heading">Manage Clients</h4>
            </li>
          </router-link>
        </div>
      </ul>
      <div class="nav-item logout-button-box" @click="logout">
        <icon name="log-out" class="nav-icon"></icon>
        <h4 class="nav-heading">Logout</h4>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";

export default {
  data() {
    return {
      user: {}
    };
  },

  methods: {
    // Logout the user.
    logout: async function() {
      UserService.logoutUser();
    }
  },

  computed: {
    // Query the store to see whether the user is logged in or not.
    userIsCounsellor: function() {
      return this.$store.getters["authentication/isCounsellor"];
    }
  },

  mounted() {
    // get user from the store
    this.user = this.$store.state.authentication.user;
  }
};
</script>

<style lang="scss" scoped>
@import "../../scss/global.scss";

$icon-width: 2rem;
$icon-height: $icon-width;

.sidebar-wrapper {
  position: fixed;
  // text-align: center;
  top: 0;
  left: 0;
  bottom: 0;
  height: 100%;
  // z-index: 1;
  width: $nav-width;
  // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  background-color: $color-canvas;

  .navigation {
    margin-top: 1rem;
    list-style: none;

    .router-link-active {
      .nav-item {
        &,
        &:hover {
          color: $color-white;
        }
        &:before {
          width: 100%;
        }
      }
    }
  }
  .nav-item {
    position: relative;
    padding: 1rem;
    margin-bottom: 0.5rem;
    margin-left: 0.5rem;
    width: 100%;

    text-decoration: none;
    transition: all 0.2s;
    color: $color-grey-dark;

    &:before {
      content: "";
      position: absolute;
      border-radius: 7.5px;
      top: 0;
      left: 0;
      background-color: $color-primary;
      width: 0;
      z-index: -1;
      height: 100%;
      // margin-left: -0.5rem;
      transition: width 0.2s ease-in-out;

      box-shadow: 2px 2px 2px rgba($color-primary, 0.5);
    }

    &:hover {
      color: $color-primary;
    }

    .nav-icon {
      height: $icon-height;
      width: $icon-height;
      display: inline-block;
      margin-right: 1rem;
      vertical-align: middle;
    }

    .nav-heading {
      display: inline-block;
      font-size: 1.4rem;
      font-weight: 300;
      vertical-align: middle;
    }
  }

  .logout-button-box {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    color: $color-black;

    &.nav-item {
      &:before {
        background-color: $color-error;
      }
    }

    &:hover {
      color: $color-white;
      &.nav-item {
        &:before {
          width: 100%;
          box-shadow: 2px 2px 2px rgba($color-error, 0.5);
        }
      }
    }
  }
}
</style>
