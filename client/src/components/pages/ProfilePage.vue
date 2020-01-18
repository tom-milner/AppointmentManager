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
                    Send this link to anyone that needs to book an appointment but doesn't have an account. It will
                    create a guest account for them, which they can activate (turn into a real account) later.
                </p>
            </div>

            <!-- Their personal information -->
            <div class="container personal-info">
                <h3 class="heading-3">Personal Information</h3>
                <div class="icon-box" @click="toggleUserCanEdit">
                    <icon name="edit" class="edit-icon"></icon>
                </div>
                <form v-on:submit.prevent="updateUserDetails">
                    <ul class="details">
                        <li>
                            <h4 class="heading-4">Firstname:</h4>
                            <input type="text" class="form-input" v-if="userCanEdit" v-model="user.firstname" />
                            <h4 class="heading-4" v-else>{{ user.firstname }}</h4>
                        </li>
                        <li>
                            <h4 class="heading-4">Lastname:</h4>
                            <input type="text" class="form-input" v-if="userCanEdit" v-model="user.lastname" />
                            <h4 class="heading-4" v-else>{{ user.lastname }}</h4>
                        </li>
                        <li>
                            <h4 class="heading-4">Username:</h4>
                            <input type="text" class="form-input" v-if="userCanEdit" v-model="user.username" />
                            <h4 class="heading-4" v-else>{{ user.username }}</h4>
                        </li>
                        <li>
                            <h4 class="heading-4">Email:</h4>
                            <input type="text" class="form-input" v-if="userCanEdit" v-model="user.email" />
                            <h4 class="heading-4" v-else>{{ user.email }}</h4>
                        </li>
                    </ul>
                    <!--  Message -->
                    <div class="response-message" v-if="updateInfoMessage.length > 0">
                        <h4 class="heading-4" :class="requestOk ? 'success' : 'error'">{{ updateInfoMessage }}</h4>
                    </div>
                    <button v-if="userCanEdit" class="btn btn-secondary save-button">Save</button>
                </form>
            </div>

            <!--  For counsellors only -->
            <div v-if="userIsCounsellor" class="container create-counsellor">
                <h3 class="heading-3">Create a Counsellor</h3>
                <p class="paragraph info">
                    This will send an email to the user that will enable them to change their account status to a
                    counsellor.
                </p>
                <form v-on:submit.prevent="sendNewCounsellorEmail">
                    <h4 class="form-heading">Enter email of new counsellor:</h4>
                    <input class="form-input" type="email" v-model="newCounsellorEmail" />
                    <h4 class="form-heading">Your password:</h4>
                    <input class="form-input" type="password" v-model="createCounsellorPassword" />
                    <div class="response-message" v-if="createCounsellorMessage.length > 0">
                        <h4 class="heading-4" :class="requestOk ? 'success' : 'error'">
                            {{ createCounsellorMessage }}
                        </h4>
                    </div>
                    <button class="btn btn-secondary send-button">Send Email</button>
                </form>
            </div>

            <!-- Send Forgot Password Email -->
            <div class="container reset-password">
                <button @click="sendResetPasswordEmail" class="btn btn-primary">{{ buttonContent }}</button>
                <p class="paragraph info">
                    Pressing this button will send an email to your account containing a link to reset your password. If
                    you ignore the email, your password will remain unchanged.
                </p>
            </div>

            <!-- Delete Button -->
            <div class="container delete-account">
                <button @click="showDeleteDialogue = true" class="btn btn-disapproved">Delete Your Account</button>
                <p class="paragraph info">This will remove all of your appointment from the system.</p>
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
import Dialogue from "@/components/layout/DialogueBox";

export default {
    components: {
        Dialogue
    },
    data() {
        return {
            user: {},
            updateInfoMessage: "",
            createCounsellorMessage: "",
            userCanEdit: false,
            requestOk: false,
            buttonContent: "Send Reset Password Email",
            emailsLeft: 3,
            showDeleteDialogue: false,
            newCounsellorEmail: "",
            confirmNewCounsellorEmail: "",
            createCounsellorPassword: ""
        };
    },

    async beforeMount() {
        this.user = this.$store.state.authentication.user;
        let response;
        if (this.userIsCounsellor) response = await UserService.getCounsellor(this.user._id);
        else response = await UserService.getClient(this.user._id);
        this.user = response.data.counsellor || response.data.client;
    },
    mounted() {
        if (this.userIsCounsellor) document.querySelector(".copy-message").style.animation = "none";

        // reset number of emails left every 3 minutes
        setTimeout(
            function() {
                this.emailsLeft = 3;
            }.bind(this),
            60000
        );
    },
    computed: {
        userIsCounsellor: function() {
            return this.$store.getters["authentication/isCounsellor"];
        }
    },
    methods: {
        async sendNewCounsellorEmail() {
            let response;
            try {
                response = await UserService.sendNewCounsellorEmail(
                    this.newCounsellorEmail,
                    this.createCounsellorPassword
                );
            } catch (error) {
                response = error.response;
            }
            this.createCounsellorMessage = response.data.message;
            this.requestOk = response.data.success;
        },

        async deleteUser() {
            try {
                let response = await UserService.deleteUser(this.user._id);
                if (response.data.success) {
                    UserService.logoutUser({ fullyLogout: true });
                }
            } catch (error) {
                console.log(error);
            }
        },

        async sendResetPasswordEmail() {
            try {
                if (this.emailsLeft < 1) {
                    this.buttonContent = "You can only send 3 emails per minute.";
                    return;
                }
                let response = await AuthenticationService.forgotPassword(this.user.email);
                console.log(response);
                this.buttonContent = response.data.message;
                this.emailsLeft--;
            } catch (error) {
                this.buttonContent = Utils.isString(error) ? error : error.response.data.message;
            }
        },

        toggleUserCanEdit() {
            this.userCanEdit = !this.userCanEdit;
            if (this.userCanEdit) {
                this.updateInfoMessage = "";
            }
        },

        async updateUserDetails() {
            try {
                let response;
                // send different requests depending on whether the user is a client or a counsellor.
                if (this.userIsCounsellor) {
                    response = await UserService.updateUser(this.user._id, this.user, true);
                } else {
                    response = await UserService.updateUser(this.user._id, this.user);
                }
                if (!response.data.success) {
                    throw { response };
                }
                this.requestOk = true;
                this.updateInfoMessage = response.data.message;
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
            } catch (error) {
                console.log(error);
                this.requestOk = false;
                this.updateInfoMessage = Utils.isString(error) ? error : error.response.data.message;
            }
        },

        generateBookingLink() {
            return `${window.location.origin}/auth/guest/${window.btoa(this.user._id)}`;
        },
        copyToClipboard(event) {
            let link = event.target.innerText;
            console.log(link);

            this.linkCopied = Utils.copyToClipboard(link, document);

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
