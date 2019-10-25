// const nodemailer = require("nodemailer");
const Config = require("../Config");
const moment = require("moment");
const nodemailer = require("nodemailer");
const GoogleAuth = require("../googleauth/GoogleAuth");
const Role = require("../../models/Role");
const Logger = require("../Logger")(module);


// trying out javascript classes (new ES6 feature);

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

    async init() {

        let googleAuth = new GoogleAuth();

        // configure nodemailer
        let auth = {
            type: 'oauth2',
            user: Config.mailer.email,
            clientId: googleAuth.clientId,
            clientSecret: googleAuth.clientSecret,
            refreshToken: googleAuth.refreshToken,
            accessToken: googleAuth.accessToken
        };

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: auth
        })
        Logger.info("Mailer initialized.")

    }


    weeksAppointments(user, appointments) {
        let email = this.email;

        email.to = user.email;
        email.subject = "Your Upcoming Appointments";
        email.html = `<p>Hi ${user.firstname}</p>
                  <p>Here are your upcoming appointments this week:</p>`;

        for (let appointment of appointments) {

            let firstname = appointment.clients[0].firstname;
            let lastname = appointment.clients[0].lastname

            let startTime = moment(appointment.startTime).format("LT");
            let endTime = moment(appointment.endTime).format("LT");
            let date = moment(appointment.startTime).format("LL");

            email.html += `<li>
                      <h4>${appointment.title}: ${startTime} - ${endTime} </h4>
                      <p>Date: ${date}</p>
                      <p>Client: ${firstname} ${lastname}</p>
                      <p>Appointment Type: ${appointment.appointmentType.name}</p>
                      <p>Approved: ${appointment.isApproved}</p>
                    </li>`;
        }
        return this;
    }



    confirmNewUser(user, token) {
        let email = this.email;
        email.to = user.email;

        email.subject = "Account Created."

        if (user.role == Role.Guest) {
            email.html = ` <p> Hi ${user.firstname}, </p> 
      <p> Welcome to appointment manager. </p>
      <p> You should 've received an email containing your appointment info.</p>
      <p > To view or edit your appointment details, activate your account using the following link. </p> 
      <a href = "${Config.clientUrl}/auth/reset-password?token=${token}">Activate Account</a>`
        } else {
            email.html = ` <p> Hi ${user.firstname}, </p> 
      <p> Welcome to appointment manager. </p>
      <p> Access your appointments using the following link: </p>
      <a href = "${Config.clientUrl}/home">Access Appointments</a>`
        }

        return this;
    }


    newCounsellorEmail(referringCounsellor, toEmail, token) {
        let email = this.email;
        email.to = toEmail;

        email.subject = "Create a Counsellor Account.";

        email.html = ` <p> Hi there, </p> 
      <p> Welcome to appointment manager. </p>
      <p> ${referringCounsellor.firstname} ${referringCounsellor.lastname} has given you authentication to create a counsellor's account.</p>
      <p > To create your new account, follow this link:</p> 
      <a href = "${Config.clientUrl}/auth/register?token=${token}">Activate Account</a>`

        return this;
    }

    forgotPassword(user, token, requestIp) {

        let email = this.email;
        email.to = user.email;
        email.subject = "Forgotten Password";
        email.html = `<p>Hi ${user.firstname}.</p>
                  <p>We see you've forgotten your password.</p>
                  <p>Please follow this link to reset your password:</p>
                  <a href="${Config.clientUrl}/auth/reset-password?token=${token}">Reset Password</a>
                  <p>Ip: ${requestIp}</p>
                  `;
        return this;
    }

    confirmAppointment(appointments, client, counsellor) {



        let email = this.email;

        // set email to field
        email.to = [client.email, counsellor.email];

        // set email subject.
        email.subject = "Appointment Confirmation";

        // set email contents
        email.html = `<p>Hi ${client.firstname}.</p>
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
                      <p>Client: ${client.firstname} ${client.lastname}</p>
                      <p>Appointment Type: ${appointment.appointmentType.name}</p>
                    </li>`;
        }

        email.html +=
            `<p>To edit your appointment details, follow <a href="${Config.clientUrl}/auth/login" >This Link</a> </p>`;

        return this;
    }

    send() {
        this.email.from = Config.mailer.email;
        return this.transporter.sendMail(this.email);
    }
}

module.exports = Mailer;