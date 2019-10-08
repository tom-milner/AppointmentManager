// const nodemailer = require("nodemailer");
const Config = require("../Config");
const moment = require("moment");

// setup mailer 
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(Config.mailer.apiKey);

// trying out javascript classes (new ES6 feature);
class Mailer {

  constructor() {
    this.email = {};
    this.email.from = Config.mailer.email;

    // this.email.toEmail = toEmail;
  }

  forgotPassword(user, token, requestIp) {
    let email = this.email;
    email.to = user.email;
    email.subject = "Forgotten Password";
    email.html = `<p>Hi ${user.firstname}.</p>
                  <p>We see you've forgotten your password.</p>
                  <p>Please follow this link to reset your password:</p>
                  <a href="${Config.url}auth/reset-password?token=${token}">Reset Password</a>
                  <p>Ip: ${requestIp}</p>
                  `;
    return this;
  }

  confirmAppointment(appointments, client, counsellor) {
    let email = this.email;

    // set email to field
    email.to = client.email;

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
                      <h4>${appointment.title}</h4>: ${startTime} - ${endTime}
                      <p>Date: ${date}</p>
                      <p>Counsellor: ${counsellor.firstname} ${counsellor.lastname}</p>
                      <p>Appointment Type: ${appointment.appointmentType.name}</p>
                    </li>`;

    }

    return this;

  }

  send() {
    console.log(this.email);
    sgMail.send(this.email);
  }
}

module.exports = Mailer;