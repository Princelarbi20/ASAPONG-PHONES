import { Register } from '../../modules/userRegister.js';
import { normalizeEmail, createAndStoreOtp, sendOtpEmail, getOtpCooldownRemaining } from '../../utils/otpHelpers.js';

export const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await Register.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified.' });
    }

    const remainingCooldown = getOtpCooldownRemaining(user);
    if (remainingCooldown > 0) {
      return res.status(429).json({
        success: false,
        code: 'OTP_COOLDOWN',
        message: `Please wait ${remainingCooldown} seconds before requesting a new code.`,
        requiresVerification: true,
        email: user.email
      });
    }

    const otp = await createAndStoreOtp(user, 10 * 60 * 1000);
    await sendOtpEmail(user, otp);

    return res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.', requiresVerification: true, email: user.email });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while resending OTP.' });
  }
};
