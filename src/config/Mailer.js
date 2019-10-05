// const nodemailer = require("nodemailer");
const Config = require("../config/Config");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(Config.mailer.apiKey);

module.exports = sgMail;