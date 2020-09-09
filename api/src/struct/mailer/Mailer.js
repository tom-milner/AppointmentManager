// This file contains the Mailer class. It handles all email related operations.

const Config = require("../Config");
const moment = require("moment");
const nodemailer = require("nodemailer");
const GoogleAuth = require("../googleauth/GoogleAuth");
const Roles = require("../../models/Roles");
const Logger = require("../Logger");

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

  /**
   * This function initialises the Mailer.
   * It connects to Gmail(using GoogleAuth.js) and creates a Nodemailer transport to send the emails with.
   * @param {{}} isProd - Whether the application is running in a production environment or not.
   */
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

  /**
   * Create an email containing the week's appointments.
   * @param {{}} user - The user to send the email to.
   * @param {[]} appointments - The appointments to include in the email.
   */
  weeksAppointments(user, appointments) {
    let email = this.email;

    email.to = user.email;
    email.subject = "Your Upcoming Appointments";
    email.html = `<p>Hi ${user.firstname}</p>
                  <p>Here are your upcoming appointments this week:</p>`;

    // Loop through the appointments and append their details to the email.
    for (let appointment of appointments) {
      // Turn the list of client appointments into a single string of the form "Firstname Lastname, Firstname Lastname"
      let clients = appointment.clients.reduce(
        // Reduce turns an array into a single value.
        (acc, client, index) =>
          (acc += `${client.firstname} ${client.lastname}${appointment.clients.length != index + 1 ? ", " : ""}`),
        "" // Provide "" as the initial value.
      );

      // Format the details so they are easy to read.
      let startTime = moment(appointment.startTime).format("LT");
      let endTime = moment(appointment.endTime).format("LT");
      let date = moment(appointment.startTime).format("LL");
      // Add the appointment to the email.
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

  /**
   * This creates an email for a new user welcoming them to the application.
   * If the user is a guest it will also email them their password reset token that they can use to activate their account.
   * @param {{}} user - The user to send the email to.
   * @param {String} token - (Optional) The password reset token that the guest can use to activate their account.
   */
  confirmNewUser(user, token) {
    let email = this.email;
    email.to = user.email;

    email.subject = "Account Created.";

    email.html = `<p> Hi ${user.firstname}, </p> 
                      <p> Welcome to appointment manager. </p>`;

    //If the user is a guest include the reset token they can use to activate their account.
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

  /**
   * This function created am email for a new counsellor containing a link to create a new counsellor account.
   * @param {{}} referringCounsellor - The counsellor that authenticated the new counsellor.
   * @param {String} toEmail - The recipient email address.
   * @param {String} token - The counsellor registration token for the new counsellor to use.
   */
  newCounsellorEmail(referringCounsellor, toEmail, token) {
    this.email.to = toEmail;

    this.email.subject = "Create a Counsellor Account.";

    this.email.html = ` <p> Hi there, </p> 
      <p> Welcome to appointment manager. </p>
      <p> ${referringCounsellor.firstname} ${referringCounsellor.lastname} has given you authentication to create a counsellor's account.</p>
      <p > To create your new account, follow this link:</p> 
      <a href = "${Config.CLIENT_URL}/auth/register?token=${token}">Create Account</a>`;

    return this;
  }

  /**
   * Create an email for user that requested to change their password that contains a link that they can use to reset their password.
   * @param {{}} user - The user that requested the password reset.
   * @param {String} token - The password reset token.
   * @param {{}} requestIp - The IP address of the device that made the request.
   */
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

  /**
   * Create an email for a counselor and any clients involved in an appointment.
   * @param {[]} appointments - The appointments to include in the email.
   * @param {[]} clients - The clients to send the email to.
   * @param {{}} counsellor - The counsellor to send the email to.
   */
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
      // Format dates and times.
      let startTime = moment(appointment.startTime).format("LT");
      let endTime = moment(appointment.endTime).format("LT");
      let date = moment(appointment.startTime).format("LL");

      // Add the appointment to the email.
      email.html += `<li>
                      <h4>${appointment.title}: ${startTime} - ${endTime} </h4>
                      <p>Date: ${date}</p>
                      <p>Counsellor: ${counsellor.firstname} ${counsellor.lastname}</p>
                      <p>Clients: ${clients.reduce(
                        (acc, client, index) =>
                          // This turns the array of clients into a single string containing each users firstname and lastname. Each client is seperated by commas.
                          (acc += `${client.firstname} ${client.lastname}${index != clients.length - 1 ? ", " : ""}`),
                        ""
                      )}</p>
                      <p>Appointment Type: ${appointment.appointmentType.name}</p>
                      <p>Approved: ${appointment.isApproved}</p>
                    </li>`;
    }

    email.html += `</ul>
            <p>To edit your appointment details, follow <a href="${Config.CLIENT_URL}/auth/login" >This Link</a> </p>`;

    this.email = email;
    return this;
  }

  /**
   * Alert the clients / counsellor that an appointment detail has been changed.
   * @param {{}} title - The title of the appointment that's been changed.
   * @param {{}} data - The changed appointment information.
   * @param {[]} users - The users involved in the appointment.
   */
  alertAppointmentChanged(title, data, users) {
    let recipients = users.map(user => user.email);
    let email = this.email;
    email.to = recipients;
    email.subject = "Appointment Updated";
    email.html = `<p>Hi there,</p>
                    <p>The following appointment (${title}) has been updated:</p>`;

    let keys = Object.keys(data);
    // Add each changed field to the appointment.
    for (const key of keys) {
      email.html += `<p>${key} : ${data[key]}</p>`;
    }

    return this;
  }

  /**
   * Send the constructed emails.
   */
  async send() {
    // Only send the email if the application is running in a production environment.
    if (!this.isProd) {
      console.log(this.email);
      return;
    }
    this.email.from = Config.mailer.EMAIL;

    try {
      let res = await this.transporter.sendMail(this.email);
      Logger.info("Email sent.", res);
    } catch (error) {
      Logger.error("Error sending email.", error);
      // If the google tokens are invalid, new tokens need to be obtained.
      if (error.code == "EENVELOPE") this.googleAuth.reset();
    }
  }
}

module.exports = Mailer;
