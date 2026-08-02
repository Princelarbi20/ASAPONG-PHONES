import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { sendEmail } from './resend.js';

export const normalizeEmail = (value) => value?.toLowerCase().trim() || '';

export const isOtpExpired = (expiresAt) => {
  if (!expiresAt) return true;
  const expiryDate = new Date(expiresAt);
  return Number.isNaN(expiryDate.getTime()) || expiryDate.getTime() <= Date.now();
};

export const getOtpCooldownRemaining = (user) => {
  if (!user?.otpCooldownUntil) return 0;
  const remainingMs = new Date(user.otpCooldownUntil).getTime() - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
};

export const createAndStoreOtp = async (user, expiresInMs = 10 * 60 * 1000) => {
  const otp = randomInt(100000, 1000000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  user.otp = hashedOtp;
  user.otpExpires = new Date(Date.now() + expiresInMs);
  user.otpAttempts = 0;
  user.otpAttemptWindow = null;
  user.otpCooldownUntil = new Date(Date.now() + 60_000);
  await user.save();
  return otp;
};

export const sendOtpEmail = async (user, otp) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your account',
      html: `<!DOCTYPE html><html><body><h2>Hi ${user.userName || 'there'},</h2><p>Your verification code is:</p><h1>${otp}</h1><p>This code expires in 10 minutes.</p></body></html>`
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};
