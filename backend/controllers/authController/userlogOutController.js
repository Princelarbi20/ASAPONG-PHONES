import { clearAuthCookies } from "../../utils/authCookies.js";

export const userLogoutController = async (req, res) => {
    try {
        clearAuthCookies(res);
        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};