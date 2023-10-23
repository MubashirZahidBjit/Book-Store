const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0f72839eeecf01",
    pass: "c8f98cecba2f70",
  },
});

module.exports = transport;
