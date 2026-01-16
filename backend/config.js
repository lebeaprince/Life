const parseBoolean = value => value === "true";
const parsePort = value => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const smtpPort = parsePort(process.env.SMTP_PORT) || 587;

module.exports = {
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pharmacy",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: parseBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from:
      process.env.SMTP_FROM ||
      '"Pharma Care Pharmacies" <no-reply@example.com>'
  }
};
