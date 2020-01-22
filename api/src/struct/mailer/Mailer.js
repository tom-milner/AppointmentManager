// const nodemailer = require("nodemailer");
const Config = require("../Config");
const moment = require("moment");
const nodemailer = require("nodemailer");
const GoogleAuth = require("../googleauth/GoogleAuth");
const Roles = require("../../models/Roles");
const Logger = require("../Logger");

// TODO: refactor to not use class.
class Mailer {
    // create singleton
    constructor() {
        if (!!Mailer.instance) {
            return Mailer.instance;
        }

        Mailer.instance = this;
        this.email = {};
        return this;
    }

    // This function initialises the Mailer.
    // It connects to Gmail(using GoogleAuth) and creates a Nodemailer transport to send the emails with.
    async init(isProd) {
        let googleAuth = new GoogleAuth();
        this.googleAuth = googleAuth;
        // Create the email authentication details to use to send emails.
        let auth = {
            type: "oauth2",
            user: Config.mailer.EMAIL,
            clientId: googleAuth.clientId,
            clientSecret: googleAuth.clientSecret,
            refreshToken: googleAuth.refreshToken,
            accessToken: googleAuth.accessToken
        };

        // Save whether the application is running in a production environment globally.
        this.isProd = isProd;

        // Create the transporter.
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: auth
        });
        Logger.info("Mailer initialized.");

    }

    weeksAppointments(user, appointments) {
        let email = this.email;

        email.to = user.email;
        email.subject = "Your Upcoming Appointments";
        email.html = `<p>Hi ${user.firstname}</p>
                  <p>Here are your upcoming appointments this week:</p>`;

        // Loop through the appointments and append their details to the email.
        for (let appointment of appointments) {

            // Turn the list of client appointments into a single string of the form "Firstname Lastname, Firstname Lastname"
            let clients = appointment.clients.reduce( // Reduce turns an array into a single value.
                (acc, client, index) =>
                acc +=
                `${client.firstname} ${client.lastname}${appointment.clients.length != (index+1) ? ", ": ""}`,
                "" // Provide "" as the initial value.
            );

            // Format the details so they are easy to read.
            let startTime = moment(appointment.startTime).format("LT");
            let endTime = moment(appointment.endTime).format("LT");
            let date = moment(appointment.startTime).format("LL");

            email.html += `<li>
                      <h4>${appointment.title}: ${startTime} - ${endTime} </h4>
                      <p>Date: ${date}</p>
                      <p>Clients: ${clients}</p>
                      <p>Appointment Type: ${appointment.appointmentType.name}</p>
                      <p>Approved: ${appointment.isApproved}</p>
                    </li>`;
        }
        this.email = email;

        return this;
    }

    confirmNewUser(user, token) {
        let email = this.email;
        email.to = user.email;

        email.subject = "Account Created.";

        email.html = `<p> Hi ${user.firstname}, </p> 
                      <p> Welcome to appointment manager. </p>`

        if (user.role == Roles.GUEST) {
            email.html += `
                <p> You should 've received an email containing your appointment info.</p>
                <p > To view or edit your appointment details in the application, activate your account using the following link. </p> 
                <a href = "${Config.CLIENT_URL}/auth/reset-password?token=${token}">Activate Account</a>`;
        } else {
            email.html += `
                <p> Access your appointments using the following link: </p>
                <a href = "${Config.CLIENT_URL}/home">Access Appointments</a>`;
        }
        this.email = email;

        return this;
    }

    // Send
    newCounsellorEmail(referringCounsellor, toEmail, token) {
        let email = this.email;
        email.to = toEmail;

        email.subject = "Create a Counsellor Account.";

        email.html = ` <p> Hi there, </p> 
      <p> Welcome to appointment manager. </p>
      <p> ${referringCounsellor.firstname} ${referringCounsellor.lastname} has given you authentication to create a counsellor's account.</p>
      <p > To create your new account, follow this link:</p> 
      <a href = "${Config.CLIENT_URL}/auth/register?token=${token}">Create Account</a>`;
        this.email = email;

        return this;
    }

    // Create an email to the user that requested to change their password that contains a link that they can use to reset their password.
    forgotPassword(user, token, requestIp) {
        let email = {};
        email.to = user.email;
        email.subject = "Forgotten Password";
        email.html = `<p>Hi ${user.firstname}.</p>
                  <p>We see you've forgotten your password.</p>
                  <p>Please follow this link to reset your password:</p>
                  <a href="${Config.CLIENT_URL}/auth/reset-password?token=${token}">Reset Password</a>
                  <p>Ip: ${requestIp}</p>
                  `;
        this.email = email;

        return this;
    }

    // Create an email to the user  confirming the new appointment booking.
    confirmAppointment(appointments, clients, counsellor) {
        let email = this.email;

        // set the "to" field to the emails of the clients and counsellor.
        email.to = [...clients.map(client => client.email), counsellor.email];

        // set email subject.
        email.subject = "Appointment Confirmation";

        // set email contents
        email.html = `<p>Hi there.</p>
                  <p>Here are your confirmed appointments:</p>
                  <ul>`;

        for (let appointment of appointments) {
            let startTime = moment(appointment.startTime).format("LT");
            let endTime = moment(appointment.endTime).format("LT");
            let date = moment(appointment.startTime).format("LL");
            email.html += `<li>
                      <h4>${appointment.title}: ${startTime} - ${endTime} </h4>
                      <p>Date: ${date}</p>
                      <p>Counsellor: ${counsellor.firstname} ${counsellor.lastname}</p>
                      <p>Clients: ${clients.reduce((acc, client, index) =>
                          // This turns the array of clients into a single string containing each users firstname and lastname. Each client is seperated by commas.
                    (acc += `${client.firstname} ${client.lastname}${!index == clients.length - 1 ? ", " : ""}`),"")}</p>
                      <p>Appointment Type: ${appointment.appointmentType.name}</p>
                      <p>Approved: ${appointment.isApproved}</p>
                    </li>`;
        }

        email.html +=
            `<p>To edit your appointment details, follow <a href="${Config.CLIENT_URL}/auth/login" >This Link</a> </p>`;

        this.email = email;
        return this;
    }

    // Alert the clients/counsellor that an appointment detail has been changed.
    alertAppointmentChanged(appointment, data, users) {
        let tos = users.map(user => user.email);
        let email = this.email;
        email.to = tos;
        email.subject = "Appointment Updated";
        email.html = `<p>Hi there,</p>
                    <p>The following appointment (${appointment.title}) has been updated:</p>`;

        let keys = Object.keys(data);
        for (const key of keys) {
            email.html += `<p>${key} : ${data[key]}</p>`;
        }

        return this;
    }

    // Function to send the built emails. 
    async send() {
        // Only send the email if the application is running in a production environment.
        if (!this.isProd) {
            console.log(this.email);
            return;
        }

        this.email.from = Config.mailer.EMAIL;

        try {
            await this.transporter.sendMail(this.email);
        } catch (error) {
            Logger.error("Error sending email.", error);
            // If the google tokens are invalid, new tokens need to be obtained.
            if (error.code == 'EENVELOPE') this.googleAuth.reset();

        }
    }
}

module.exports = Mailer;