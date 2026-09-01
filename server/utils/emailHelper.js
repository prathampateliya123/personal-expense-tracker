/**
 * utils/emailHelper.js
 * Sends emails when SMTP is configured; logs reset link in development otherwise.
 */

import nodemailer from "nodemailer";

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Send password reset email or log link in development.
 */
export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const subject = "Reset your ExpenseTracker password";
  const html = `
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
  `;

  if (isSmtpConfigured()) {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html,
    });
    return { sent: true, method: "email" };
  }

  console.log("\n--- Password reset link (dev) ---");
  console.log(`User: ${email}`);
  console.log(`Link: ${resetUrl}`);
  console.log("---------------------------------\n");

  return { sent: false, method: "console", resetUrl };
};
