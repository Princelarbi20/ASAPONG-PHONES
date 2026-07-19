import jwt from "jsonwebtoken";
import { setAuthCookies, clearAuthCookies } from '../utils/authCookies.js';

const verifyToken = async (req, res, next) => {
  try {
    // 1. Get the Access Token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.split(" ")[1];
    const token = headerToken || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. Login required." });
    }

    try {
      // 2. Try to verify Access Token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      // 3. If Access Token is expired, check for Refresh Token
      if (error.name === "TokenExpiredError") {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({ success: false, message: "Session expired. Please login again." });
        }

        try {
          // 4. Verify Refresh Token
          const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

          // 🚀 FIX: Decode the expired access token WITHOUT verification to safely retrieve the email address
          const expiredPayload = jwt.decode(token);
          const userEmail = expiredPayload?.email || refreshDecoded.email || "";

          // 5. Generate a fresh Access Token with all required payload fields
          const newAccessToken = jwt.sign(
            { 
              id: refreshDecoded.id, 
              email: userEmail, // 🚀 Safely populated
              role: refreshDecoded.role 
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "10m" }
          );

          // Keep refreshed credentials in HttpOnly cookies. The browser never
          // needs access to a JWT in localStorage or a response header.
          const newRefreshToken = jwt.sign(
            { id: refreshDecoded.id, email: userEmail, role: refreshDecoded.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
          );
          setAuthCookies(res, newAccessToken, newRefreshToken);
          
          req.user = { id: refreshDecoded.id, email: userEmail, role: refreshDecoded.role };
          req.authRefreshed = true;
          return next();
        } catch (refreshErr) {
          clearAuthCookies(res);
          return res.status(403).json({ success: false, message: "Invalid refresh session." });
        }
      }
      throw error; // If error is not "Expired", it's "Invalid"
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

export default verifyToken;
