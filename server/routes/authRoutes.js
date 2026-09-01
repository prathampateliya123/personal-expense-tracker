/**
 * routes/authRoutes.js
 * Authentication API endpoints.
 */

import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.post("/register", requireDb, register);
router.post("/login", requireDb, login);
router.post("/verify-otp", requireDb, verifyOtp);
router.post("/resend-otp", requireDb, resendOtp);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.post("/forgot-password", requireDb, forgotPassword);
router.post("/reset-password", requireDb, resetPassword);

export default router;
