import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM;

let client = null;

const getClient = () => {
  if (!client) {
    if (!apiKey) {
      const err = new Error("RESEND_API_KEY is not configured");
      err.statusCode = 500;
      throw err;
    }
    client = new Resend(apiKey);
  }
  return client;
};

export const sendReminderEmail = async ({ to, name, job, deadline }) => {
  if (!from) {
    const err = new Error("RESEND_FROM is not configured");
    err.statusCode = 500;
    throw err;
  }

  const subject = `Deadline reminder: ${job.company}`;
  const text = `Hi ${name || "there"},\n\n` +
    `Your application deadline is coming up for ${job.company}. ` +
    `Deadline: ${deadline}.\n\n` +
    `Please check your inbox for any updates from ${job.company} ` +
    `to see if you have been selected or if there are next steps.\n\n` +
    `- Job Tracker`;

  const html = `
    <p>Hi ${name || "there"},</p>
    <p>Your application deadline is coming up for <strong>${job.company}</strong>.</p>
    <p><strong>Deadline:</strong> ${deadline}</p>
    <p>Please check your inbox for any updates from ${job.company} to see if you have been selected or if there are next steps.</p>
    <p>- Job Tracker</p>
  `;

  return getClient().emails.send({
    from,
    to,
    subject,
    text,
    html,
  });
};
