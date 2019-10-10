// const nodemailer = require("nodemailer");
const Config = require("../Config");
const moment = require("moment");
const nodemailer = require("nodemailer");
const GoogleAuth = require("../googleauth/GoogleAuth");


// setup mailer
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(Config.mailer.apiKey);

// trying out javascript classes (new ES6 feature);

class Mailer {
  // create singleton
  constructor() {
    // setup nodemailer
    if (!!Mailer.instance) {
      return Mailer.instance;
    }
    Mailer.instance = this;
    this.email = {};
    return this;
  }

  // this creates a test account to send the email from, As i currently don't have my client SMTP server creds.
  async init() {


    // configure nodemailer
    let auth = {
      type: 'oauth2',
      user: 'denisemilnercounselling@gmail.com',
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
    };


    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: auth,
      tls: {
        rejectUnauthorized: false
      }
    })
    console.log("- Mailer initialized.")



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

    email.html += `<p>View on appointment_manager.com for more info</p>`;

    return this;
  }

  send() {
    this.email.from = Config.mailer.email;
    return this.transporter.sendMail(this.email);

    // sgMail.send(this.email);
  }
}

module.exports = Mailer;