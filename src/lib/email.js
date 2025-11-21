import nodemailer from "nodemailer";

// Import all templates
import { otpTemplate } from "./templates/otp.js";
import { loginAlertTemplate } from "./templates/loginAlert.js";
import { accountVerifiedTemplate } from "./templates/accountVerified.js";


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Single sendEmail function with template type
 */
export async function sendEmail({ to, type, subject, data }) {
  let html = "";
  let defaultSubject = "";

  switch (type) {
    case "otp":
      html = otpTemplate(data?.otp);
      defaultSubject = "Your OTP Code";
      break;

    case "login":
      html = loginAlertTemplate(data?.device, data?.location, data?.time);
      defaultSubject = "New Login Alert";
      break;

    case "account-verify":
      html = accountVerifiedTemplate(data?.firstName);
      defaultSubject = "Account Verified Successfully";
      break;

    default:
      throw new Error("Invalid email type");
  }

  try {
    await transporter.sendMail({
      from: `"CloudBucket" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || defaultSubject,
      html,
    });

    console.log(`Email of type "${type}" sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
