<template>
    <div>
        <div class="wrapper">
            <h2 class="heading-2">Welcome, {{ user.firstname }}</h2>

            <!-- The day's appointments -->
            <div class="stats">
                <div class="day" v-for="(day, index) in getDayCards" :key="day">
                    <h3 class="heading-3">{{ day }}</h3>
                    <h4 class="heading-4">
                        Total:
                        <span>{{ getDaysNoRemainingAppointments(appointmentsFromNow, index) }}</span>
                    </h4>
                    <br />
                    <h4 class="heading-4">
                        Approved:
                        <span>{{ getDaysNoRemainingAppointments(approvedAppointments, index) }}</span>
                    </h4>
                    <br />
                    <h4 class="heading-4">
                        Pending:
                        <span>{{ getDaysNoRemainingAppointments(pendingAppointments, index) }}</span>
                    </h4>
                </div>
            </div>

            <div class="container options">
                <div class="search">
                    <icon class="icon" name="search"></icon>
                    <h3 class="heading-3">Search:</h3>
                    <input type="text" v-model="searchQuery" class="form-input search-box" />
                </div>
                <div class="filter">
                    <icon name="filter"></icon>
                    <h3 class="heading-3">Filter:</h3>
                    <select v-model="chosenTimePeriod" class="form-input select">
                        <option v-for="timePeriod in timePeriods" :key="timePeriod" :value="timePeriod">{{
                            timePeriod
                        }}</option>
                    </select>
                </div>
            </div>

            <!-- Upcoming Appointments -->
            <div class="container">
                <h3 class="heading-3">Upcoming Approved Appointments</h3>

                <div
                    v-if="
                        searchAppointments(approvedAppointments) != undefined &&
                            searchAppointments(approvedAppointments).length > 0
                    "
                    class="scrolling-appointments"
                >
                    <AppointmentCard
                        v-for="appointment in searchAppointments(approvedAppointments)"
                        v-bind:key="appointment.startTime"
                        :appointment="appointment"
                        @click.native="toggleModal(appointment)"
                    ></AppointmentCard>
                </div>
                <div class="no-appointments-box" v-else>
                    <h4 class="heading-4 error">No Upcoming Appointments!</h4>
                </div>
            </div>

            <!-- Pending Appointments -->
            <div class="container">
                <h3 class="heading-3">Upcoming Pending Appointments</h3>

                <div
                    v-if="
                        searchAppointments(pendingAppointments) != undefined &&
                            searchAppointments(pendingAppointments).length > 0
                    "
                    class="scrolling-appointments"
                >
                    <AppointmentCard
                        v-for="appointment in searchAppointments(pendingAppointments)"
                        v-bind:key="appointment.startTime"
                        :appointment="appointment"
                        @click.native="toggleModal(appointment)"
                    ></AppointmentCard>
                </div>
                <div class="no-appointments-box" v-else>
                    <h4 class="heading-4 error">No Pending Appointments!</h4>
                </div>
            </div>

            <!-- Calendar -->
            <div class="container">
                <h3 class="heading-3">Your Calendar</h3>
                <appointment-calendar
                    v-on:update-events="getUserAppointments"
                    :clientAppointments="appointments"
                    class="calendar"
                ></appointment-calendar>
            </div>

            <!-- Modal -->
            <ViewAppointment
                :appointment="selectedAppointment"
                :isCounsellor="isUserCounsellor"
                v-if="modalDisplayed"
                v-on:close-modal="
                    modalDisplayed = false;
                    getUserAppointments();
                "
            ></ViewAppointment>
        </div>
    </div>
</template>

<script>
import AppointmentCard from "@/components/pages/HomePage/AppointmentCard.vue";
import AppointmentService from "@/services/AppointmentService";
import AppointmentCalendar from "@/components/misc/Calendar/AppointmentCalendar";
import Role from "@/models/Role";
import ViewAppointment from "@/components/misc/ViewAppointment/ViewAppointment";

export default {
    components: {
        AppointmentCard,
        ViewAppointment,
        AppointmentCalendar
    },

    watch: {
        chosenTimePeriod() {
            this.getUserAppointments();
        }
    },

    computed: {
        appointmentsFromNow() {
            let now = this.moment();
            return this.appointments.filter(appointment => this.moment(appointment.startTime) >= now);
        },
        isUserCounsellor() {
            return this.user.role >= Role.Counsellor;
        },
        // returns a list of all the approved appointments
        approvedAppointments() {
            return this.appointmentsFromNow
                ? this.appointmentsFromNow.slice(0, 20).filter(appointment => appointment.isApproved)
                : [];
        },
        // returns a list of all the non-approved (pending) appointments
        pendingAppointments() {
            return this.appointmentsFromNow
                ? this.appointmentsFromNow.slice(0, 20).filter(appointment => !appointment.isApproved)
                : [];
        },
        getDayCards() {
            let dayCards = [];
            const noCards =
                this.timePeriods.indexOf(this.chosenTimePeriod) + 1 >= 3
                    ? 3
                    : this.timePeriods.indexOf(this.chosenTimePeriod)+1;

            for (let i = 0; i < noCards; i++) {
                dayCards.push(
                    this.moment()
                        .add(i, "day")
                        .calendar()
                        .split(" ")[0]
                );
            }
            return dayCards;
        }
    },

    methods: {
        getDaysNoRemainingAppointments(appointments, days) {
            const now = this.moment();
            const endOfDay = now
                .clone()
                .startOf("day")
                .add(1, "day");

            if (days) {
                now.add(days, "day").startOf("day");
                endOfDay.add(days, "day");
            }

            return appointments.filter(appointment => this.moment(appointment.startTime).isBetween(now, endOfDay))
                .length;
        },

        searchAppointments(appointments) {
            return appointments.filter(appointment => {
                if (!this.searchQuery) return true;
                const searchQuery = this.searchQuery.toLowerCase();
                return (
                    appointment.title.toLowerCase().includes(searchQuery) ||
                    appointment.appointmentType.name.toLowerCase().includes(searchQuery)
                );
            });
        },

        getUserAppointments: async function() {
            // get user appointments from API
            // check to see if user is a client or counsellor
            let twoMonthsAgo = this.moment()
                .subtract(2, "month")
                .toString();

            // let limitTime = this.moment()
            //     .add(1, this.chosenTimePeriod)
            //     .toString();

            let limitTime =
                this.chosenTimePeriod == "All"
                    ? undefined
                    : this.moment()
                          .endOf(this.chosenTimePeriod)
                          .toString();

            let userIsCounsellor = this.user.role >= Role.Counsellor;
            let response = await AppointmentService.getAppointmentsOfUser({
                userId: this.user._id,
                isCounsellor: userIsCounsellor,
                params: {
                    fromTime: twoMonthsAgo,
                    limitTime: limitTime
                }
            });

            this.appointments = response.data.appointments;
        },

        toggleModal: async function(chosenAppointment) {
            //reload appointments
            if (chosenAppointment) {
                this.selectedAppointment = this.appointments.find(appointment => {
                    return chosenAppointment._id == appointment._id;
                });
                this.modalDisplayed = true;
            } else {
                this.selectedAppointment = {};
                this.modalDisplayed = false;
            }
            await this.getUserAppointments();
        }
    },
    data() {
        return {
            appointments: [],
            user: {},
            modalDisplayed: false,
            selectedAppointment: {},
            searchQuery: "",
            timePeriods: ["Day", "Week", "Month", "Year", "All"],
            chosenTimePeriod: "Week"
        };
    },
    mounted: async function() {
        this.user = this.$store.state.authentication.user;
        await this.getUserAppointments();
        // set timer for refreshing data
        //TODO: replace with a socket

        // poll server every minute
        this.timer = setInterval(this.getUserAppointments, 60000);
    },
    destroyed() {
        clearInterval(this.timer);
    }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.wrapper {
    position: relative;
    height: 100%;
    width: 100%;
}
.stats {
    position: absolute;
    max-width: 50%;
    right: 1rem;
    top: 1rem;

    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;

    .day {
        margin-left: 2rem;
        margin-bottom: 2rem;
        min-width: 20rem;
        display: inline-block;
        border: 1px solid $color-inactive;
        padding: 1.5rem;
        border-radius: 10px;
        h3 {
            margin-bottom: 1rem;
            font-weight: 300;
            color: $color-primary;
        }
        h4 {
            &:not(:last-child) {
                margin-bottom: 0.2rem;
            }
            display: inline;
            span {
                float: right;
            }
        }
    }
}
.container {
    margin-top: 5rem;
    overflow: hidden;
    width: 100%;
    position: relative;

    .no-appointments-box {
        height: 18rem;

        h4 {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, 50%);
            display: block;
        }
    }

    &.options {
        width: 60rem;

        & .form-input {
            vertical-align: middle;
        }
        h3 {
            width: 10rem;
            display: inline-block;
            vertical-align: middle;
        }

        .icon {
            width: 2rem;
            height: 2rem;
            display: inline-block;
            vertical-align: middle;
            color: $color-primary;
            margin-right: 1rem;
        }
        .filter {
            select {
                width: 25rem;
            }
        }

        .search {
            margin-bottom: 0.5rem;
            .search-box {
                display: inline-block;
                width: 25rem;
                vertical-align: middle;
            }
        }
    }
}

.scrolling-appointments {
    padding-left: 1rem;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    min-height: 18rem;
    margin-top: 1rem;
}
</style>
