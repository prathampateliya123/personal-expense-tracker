/**
 * routes/authRoutes.js
 * Defines authentication-related API endpoints.
 * Mounts at /api/auth in server.js.
 */

import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);

export default router;
