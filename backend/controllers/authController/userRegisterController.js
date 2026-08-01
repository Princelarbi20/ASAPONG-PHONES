import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Register } from "../../modules/userRegister.js";
import { setAuthCookies } from "../../utils/authCookies.js";
export const userRegisterController = async (req, res) => {
    try {
        const { userName, email, phone, password } = req.body;

        // 1. Validate mandatory input field presence
        if (!userName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields (username, email, phone, and password) are required."
            });
        }


        //  STRICT STRUCTURAL DATA VALIDATION ENGINE
  

        // A. Name Validation: Letters and spaces only (No symbols allowed)
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(userName)) {
            return res.status(400).json({
                success: false,
                message: "Name validation failed. Names cannot contain symbols or numerical values."
            });
        }

        // B. Email Validation: Valid email format validation check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const normalizedEmail = email.toLowerCase().trim();
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a structurally valid email address syntax."
            });
        }

        // C. Phone Validation: Strip out formatting if any and check for EXACTLY 10 digits
        const cleanPhone = phone.replace(/\D/g, ""); // Strips symbols/spaces to count pure digits
        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Phone verification failure. The contact number must be exactly 10 digits long."
            });
        }

        // D. Strong Password Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password is too weak. Must be at least 8 characters long and contain uppercase, lowercase, numbers, and at least one special character symbol (@$!%*?&#)."
            });
        }

        // ============================================================================

        // 2. Check if the email already exists in the registry track
        const existingUser = await Register.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered inside active systems."
            });
        }

       
        const hashedPassword = await bcrypt.hash(password,10);

        // 4. Instantiating new User document matching your schema definitions
        const newUser = new Register({
            userName: userName.trim(),
            email: normalizedEmail,
            phone: cleanPhone, // Stores the clean 10 digit configuration
            password: hashedPassword,
            role: "USER",
            isSuspended: false,
            cart: []
        });

        await newUser.save();

        // 5. Generate matching structural JWT payloads for immediate automatic authentication
        const tokenPayload = {
            id: newUser._id,
            role: newUser.role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
        );

        const refreshToken = jwt.sign(
            tokenPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
        );

        // 6. Set secure cookies
        setAuthCookies(res,token, refreshToken);

        // 7. Return payload data back to frontend
        return res.status(201).json({
            success: true,
            message: "Registration complete. Welcome to Asapong!",
            accountType: "USER",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                isSuspended: newUser.isSuspended,
                cart: newUser.cart
            }
        });

    } catch (error) {
        console.error("User Registration System Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server registry error encountered during verification."
        });
    }
};
