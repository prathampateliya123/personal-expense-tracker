/**
 * controllers/authController.js
 * Authentication: register, login, logout, profile, forgot/reset password.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/emailHelper.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../utils/jwtToken.js";

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

/**
 * @route   POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created — JWT stored in secure cookie",
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful — JWT stored in secure cookie",
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out — cookie cleared",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Verify JWT cookie and return current user (session check)
 */
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      authenticated: true,
      user: formatUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Please provide your email address");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to avoid email enumeration
    const genericMessage =
      "If an account exists with that email, a password reset link has been sent.";

    if (!user) {
      res.status(200).json({ success: true, message: genericMessage });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    res.status(200).json({
      success: true,
      message: genericMessage,
      ...(process.env.NODE_ENV !== "production" &&
        emailResult.resetUrl && { devResetUrl: emailResult.resetUrl }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      res.status(400);
      throw new Error("Please provide a new password");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    const authToken = generateToken(user._id);
    setTokenCookie(res, authToken);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/reset-password/:token
 * @desc    Validate reset token before showing reset form
 */
export const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    res.status(200).json({ success: true, valid: true });
  } catch (error) {
    next(error);
  }
};
