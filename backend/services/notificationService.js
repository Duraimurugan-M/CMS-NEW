import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";

// Placeholder for SMS integration
const sendSms = async ({ to, message }) => {
  console.log("SMS placeholder:", to, message);
};

export const notifyUser = async ({
  user,
  student,
  type,
  title,
  message,
  channels = ["in_app"]
}) => {
  const notification = await Notification.create({
    user,
    student,
    type,
    title,
    message,
    channel: channels
  });

  if (channels.includes("email") && user?.email) {
    await sendEmail({
      to: user.email,
      subject: title,
      html: `<p>${message}</p>`
    });
  }

  if (channels.includes("sms") && user?.phone) {
    await sendSms({ to: user.phone, message });
  }

  return notification;
};

