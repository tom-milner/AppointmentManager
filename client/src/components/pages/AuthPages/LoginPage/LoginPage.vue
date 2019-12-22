<template>
    <div class="container">
        <card :showBack="true" backUrl="/">
            <form v-on:submit.prevent="login" class="item-container">
                <h2 class="heading-2">Login</h2>
                <div class="login-items">
                    <div class="login-field">
                        <h4 class="form-heading">Username</h4>
                        <input class="form-input" v-model="username" />
                        <p class="paragraph">If you signed up from a guest account, this will be your email.</p>
                    </div>
                    <br />
                    <div class="login-field">
                        <h4 class="form-heading">Password</h4>
                        <input class="form-input" v-model="password" type="password" />
                    </div>
                </div>
                <h4 class="heading-4 error errorText">{{ errorMessage }}</h4>
                <div class="action-row">
                    <router-link to="/auth/forgot-password">
                        <p class="paragraph">Forgot password?</p>
                    </router-link>
                    <button class="btn btn-primary">Submit</button>
                </div>
            </form>
        </card>
    </div>
</template>

<script>
import Card from "@/components/layout/Card";
import UserService from "@/services/UserService";
export default {
    components: {
        Card
    },
    data() {
        return {
            username: null,
            password: null,
            errorMessage: null
        };
    },
    methods: {
        login: async function() {
            const username = this.username;
            const password = this.password;
            try {
                let response = await UserService.loginUser(username, password);
                console.log(response);
                this.$router.push("/home");
            } catch (err) {
                console.log(err);
                this.errorMessage = err.response.data.message;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
.container {
    height: 100vh;
    width: 100vw;
    background-color: $color-canvas;
    display: flex;
    justify-content: center;
    align-items: center;
}

.item-container {
    &:not(:last-child) {
        margin-bottom: 1.5rem;
    }

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.login-items {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    align-items: center;
    margin: 2rem 0;
    // height: 15rem;
}

.login-field {
    width: 30rem;
    h3 {
        font-size: 1.5rem;
        font-weight: 300;
        margin-bottom: 0.3rem;
    }
}

.action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    button {
        display: inline;
    }
    p {
        display: inline;
    }
}

.errorText {
    margin-bottom: 1rem;
}
</style>
