const nodemailer = require("nodemailer");
const { smtp } = require("./config");

const createTransporter = () => {
  if (!smtp.user || !smtp.pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set.");
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });
};

module.exports = {
  createTransporter,
  mailFrom: smtp.from
};
