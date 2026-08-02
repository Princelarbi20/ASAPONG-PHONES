import { Resend } from 'resend';

// Initialize with environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    const sender = from || process.env.EMAIL_SENDER;

    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
    });

    if (error) {
      console.error("Resend delivery failed:", error);
      throw new Error(error.message || "Failed to send email.");
    }

    return data;
  } catch (err) {
    console.error("sendEmail Error:", err);
    throw err; // Re-throw to let caller handle HTTP status codes
  }
};