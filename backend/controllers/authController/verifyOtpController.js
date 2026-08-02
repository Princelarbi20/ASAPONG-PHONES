import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Register } from '../../modules/userRegister.js';
import { normalizeEmail, isOtpExpired } from '../../utils/otpHelpers.js';
import { setAuthCookies } from '../../utils/authCookies.js';

export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required.'
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await Register.findOne({ email: normalizedEmail }).select('+otp');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found for this email.'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'This account is already verified.'
            });
        }

        if (!user.otp || isOtpExpired(user.otpExpires)) {
            return res.status(400).json({
                success: false,
                message: 'Your OTP has expired. Please request a new one.'
            });
        }

        if (user.otpAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please request a new code.'
            });
        }

        const isOtpValid = await bcrypt.compare(otp, user.otp);

        if (!isOtpValid) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            user.otpAttemptWindow = new Date();
            await user.save();
            return res.status(401).json({
                success: false,
                message: 'The OTP you entered is incorrect.'
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        user.otpAttempts = 0;
        user.otpAttemptWindow = null;
        await user.save();

        const tokenPayload = { id: user._id, role: user.role };
        const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
        const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

        setAuthCookies(res, token, refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. You are now logged in.',
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while verifying OTP.'
        });
    }
};
