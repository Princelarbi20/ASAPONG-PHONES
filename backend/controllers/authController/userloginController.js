import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Register } from "../../modules/userRegister.js";
import { ShopRequest } from "../../modules/shopRequestSchema.js";
import { setAuthCookies } from "../../utils/authCookies.js";

export const userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const searchEmail = email.toLowerCase().trim();

        // 1. REGULAR USER PATHWAY
        const regularUser = await Register.findOne({ email: searchEmail }).select('+password');

        if (regularUser) {
            const isMatch = await bcrypt.compare(password, regularUser.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid password."
                });
            }

            if (regularUser.isSuspended) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been suspended."
                });
            }

            const token = jwt.sign(
                { id: regularUser._id, role: regularUser.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
            );

            const refreshToken = jwt.sign(
                { id: regularUser._id, role: regularUser.role },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
            );

            // 🚀 FIXED: Standardized cookie setup using the shared utility
            setAuthCookies(res, token, refreshToken);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                accountType: "USER",
                user: {
                    id: regularUser._id,
                    userName: regularUser.userName,
                    email: regularUser.email,
                    phone: regularUser.phone,
                    role: regularUser.role,
                    isSuspended: regularUser.isSuspended,
                    cart: regularUser.cart
                }
            });
        }

        // 2. DEALER SHOP USER PATHWAY
        const shopUser = await ShopRequest.findOne({ email: searchEmail }).select('+password');

        if (shopUser) {
            const isMatch = await bcrypt.compare(password, shopUser.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            if (shopUser.status === "PENDING") {
                return res.status(403).json({
                    success: false,
                    message: "Your dealer account is still pending approval."
                });
            }

            if (shopUser.status === "REJECTED") {
                return res.status(403).json({
                    success: false,
                    message: "Your dealer request has been rejected."
                });
            }

            const token = jwt.sign(
                { id: shopUser._id, role: shopUser.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
            );

            const refreshToken = jwt.sign(
                { id: shopUser._id, role: shopUser.role },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
            );

            // 🚀 FIXED: Standardized cookie setup for dealers as well
            setAuthCookies(res, token, refreshToken);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                accountType: "DEALER",
                user: {
                    id: shopUser._id,
                    shopName: shopUser.shopName,
                    email: shopUser.email,
                    number: shopUser.number,
                    role: shopUser.role,
                    status: shopUser.status,
                    description: shopUser.description,
                    category: shopUser.category,
                    shopCertificates: shopUser.shopCertificates
                }
            });
        }

        // 3. NO ACCOUNT REGISTRY TRACE
        return res.status(404).json({
            success: false,
            message: "Email is not registered."
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};
