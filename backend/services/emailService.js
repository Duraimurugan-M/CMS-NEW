import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  // Simple SMTP configuration via env; can be replaced with production provider
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured; skipping email send");
    return;
  }

  const tx = getTransporter();
  await tx.sendMail({
    from: process.env.SMTP_FROM || "no-reply@cms.local",
    to,
    subject,
    html
  });
};

