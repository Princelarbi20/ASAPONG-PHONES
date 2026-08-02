import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email delivery.');
      return { id: 'mock-email-id' };
    }

    const sender = from || process.env.EMAIL_SENDER;

    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
    });

    if (error) {
      console.error('Resend delivery failed:', error);
      throw new Error(error.message || 'Failed to send email.');
    }

    return data;
  } catch (err) {
    console.error('sendEmail Error:', err);
    throw err;
  }
};