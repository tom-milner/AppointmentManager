<template>
  <div class="wrapper">
    <Card :showBack="true" backUrl="/">
      <div class="container">
        <h2 class="heading-2">Guest User</h2>

        <div class="guest-form">
          <form v-on:submit.prevent="saveUser">
            <div class="section">
              <h4 class="form-heading">Enter your email:</h4>
              <input type="email" v-model="email" class="form-input" />
            </div>
            <div class="section">
              <h4 class="form-heading">Confirm email:</h4>
              <input type="email" v-model="confirmedEmail" class="form-input" />
            </div>
            <div class="section message">
              <h4 class="heading-4 error">{{message}}</h4>
            </div>

            <div class="section saveEmail">
              <button class="btn btn-primary">Continue</button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  </div>
</template>
<script>
import Card from "@/components/layout/Card";
export default {
  data() {
    return {
      message: "",
      email: "",
      confirmedEmail: "",
      emailsMatch: false
    };
  },
  components: {
    Card
  },
  methods: {
    saveUser() {
      if (!this.emailsMatch) {
        this.message = "Emails must match";
        return;
      }
    }
  },
  watch: {
    confirmedEmail(value) {
      this.emailsMatch = value == this.email;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
.wrapper {
  width: 100%;
  height: 100vh;
  background-color: $color-canvas;
  display: flex;
  justify-content: center;
  align-items: center;

  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .guest-form {
      width: 30rem;
      margin-top: 2rem;
    }
  }
}

.section {
  &:not(:last-child) {
    margin-bottom: 1rem;
  }

  &.saveEmail {
    margin-top: 2rem;
    text-align: center;
    width: 100%;
  }

  &.message {
    width: 100%;
    text-align: center;
  }
}
</style>