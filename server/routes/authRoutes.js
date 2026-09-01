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
  validateResetToken,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.post("/register", requireDb, register);
router.post("/login", requireDb, login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.post("/forgot-password", requireDb, forgotPassword);
router.get("/reset-password/:token", requireDb, validateResetToken);
router.post("/reset-password/:token", requireDb, resetPassword);

export default router;
