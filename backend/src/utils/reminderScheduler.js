import Job from "../models/Job.js";
import { sendReminderEmail } from "./email.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const shouldSendReminder = ({ now, reminderAt, deadline, lastReminderSentAt }) => {
  if (!reminderAt || !deadline) {
    return false;
  }

  const reminderTime = new Date(reminderAt).getTime();
  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(reminderTime) || Number.isNaN(deadlineTime)) {
    return false;
  }

  if (now < reminderTime || now > deadlineTime) {
    return false;
  }

  if (!lastReminderSentAt) {
    return true;
  }

  const lastSentTime = new Date(lastReminderSentAt).getTime();
  if (Number.isNaN(lastSentTime)) {
    return true;
  }

  return now - lastSentTime >= ONE_DAY_MS;
};

export const startReminderScheduler = () => {
  const intervalMs = 60 * 1000;

  setInterval(async () => {
    const now = Date.now();

    const candidates = await Job.find({
      reminderAt: { $lte: new Date(now) },
      deadline: { $gte: new Date(now) },
    }).populate("user", "email name");

    for (const job of candidates) {
      if (!job.user?.email) {
        continue;
      }

      if (
        !shouldSendReminder({
          now,
          reminderAt: job.reminderAt,
          deadline: job.deadline,
          lastReminderSentAt: job.lastReminderSentAt,
        })
      ) {
        continue;
      }

      const deadlineLabel = new Date(job.deadline).toLocaleDateString();

      try {
        await sendReminderEmail({
          to: job.user.email,
          name: job.user.name,
          job,
          deadline: deadlineLabel,
        });

        job.lastReminderSentAt = new Date(now);
        await job.save();
      } catch (error) {
        console.error("Failed to send reminder email", error);
      }
    }
  }, intervalMs);
};
