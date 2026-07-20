import connectDB from './config/db.js';
import express from 'express';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

// 🚀 FIXED: Added the missing named import for verifyToken
import { verifyToken } from './middleware/verifyToken.js';
import { refreshToken } from './middleware/refreshToken.js';
import isAdmin from './middleware/isAdmin.js';
import { csrfProtection, issueCsrfToken } from './middleware/csrfProtection.js';

import { Register } from "./modules/userRegister.js";
import { Product } from "./modules/productSchema.js";
import { Orders } from "./modules/orderSchema.js";

import router from './route/route.js';

const app = express();
dotenv.config();

for (const variable of [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRE',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRE'
]) {
  if (!process.env[variable]) throw new Error(`${variable} must be configured before the server starts.`);
}
connectDB();

// --- ES MODULES PATH SETUPS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  })
);

// CSRF must be registered before routes that mutate state. This maintained,
// dependency-free double-submit implementation validates X-CSRF-Token.
app.use(csrfProtection);

app.get('/api/v1/csrf-token', (req, res) => {
  res.json({ csrfToken: issueCsrfToken(req, res) });
});

// Certificates contain sensitive documents. Only administrators can retrieve
// them; product images remain public under /uploads.
app.use('/uploads/certificates', verifyToken, refreshToken, isAdmin,
  express.static(path.join(__dirname, 'uploads', 'certificates')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Endpoints
app.use('/api/v1', router);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
