/**
 * controllers/authController.js
 * Auth with OTP verification for login, register, and forgot password.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  generateOtp,
  saveOtpToUser,
  verifyUserOtp,
  clearUserOtp,
  attachOtpToResponse,
} from "../utils/otpHelper.js";
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

const OTP_PURPOSES = ["login", "register", "forgot-password"];

/**
 * @route   POST /api/auth/register
 * @desc    Create account and send OTP (JWT after verify-otp)
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

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser?.isVerified) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = existingUser;

    if (user) {
      user.name = name;
      user.password = hashedPassword;
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
      });
    }

    const otp = generateOtp();
    await saveOtpToUser(user, otp, "register");

    res.status(201).json({
      success: true,
      requiresOtp: true,
      purpose: "register",
      email: user.email,
      ...attachOtpToResponse(otp),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Validate credentials and send OTP (JWT after verify-otp)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Legacy users (before OTP) — treat as verified
    if (user.isVerified == null) {
      user.isVerified = true;
      await user.save();
    }

    // Unverified account — send register OTP instead of blocking with 403
    const purpose = user.isVerified === false ? "register" : "login";
    const otp = generateOtp();
    await saveOtpToUser(user, otp, purpose);

    res.status(200).json({
      success: true,
      requiresOtp: true,
      purpose,
      email: user.email,
      ...attachOtpToResponse(otp),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for login, register, or forgot-password
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      res.status(400);
      throw new Error("Please provide email, OTP, and purpose");
    }

    if (!OTP_PURPOSES.includes(purpose)) {
      res.status(400);
      throw new Error("Invalid OTP purpose");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(400);
      throw new Error("Invalid OTP");
    }

    if (!verifyUserOtp(user, otp, purpose)) {
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    clearUserOtp(user);

    if (purpose === "register") {
      user.isVerified = true;
      await user.save();

      const token = generateToken(user._id);
      setTokenCookie(res, token);

      res.status(200).json({
        success: true,
        message: "Account verified successfully",
        user: formatUser(user),
      });
      return;
    }

    if (purpose === "login") {
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: formatUser(user),
      });
      return;
    }

    if (purpose === "forgot-password") {
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(`otp-verified-${user._id}-${Date.now()}`)
        .digest("hex");
      user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      res.status(200).json({
        success: true,
        message: "OTP verified. You can now reset your password.",
        email: user.email,
        resetAllowed: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose || !OTP_PURPOSES.includes(purpose)) {
      res.status(400);
      throw new Error("Please provide email and valid purpose");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(200).json({
        success: true,
        requiresOtp: true,
        purpose,
        email,
        message: "If account exists, a new OTP has been sent.",
      });
      return;
    }

    const otp = generateOtp();
    await saveOtpToUser(user, otp, purpose);

    res.status(200).json({
      success: true,
      requiresOtp: true,
      purpose,
      email: user.email,
      ...attachOtpToResponse(otp),
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
 * @desc    Send OTP for password reset
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Please provide your email address");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const genericMessage = "If an account exists, an OTP has been sent.";

    if (!user) {
      res.status(200).json({
        success: true,
        requiresOtp: true,
        purpose: "forgot-password",
        email: email.toLowerCase().trim(),
        message: genericMessage,
      });
      return;
    }

    const otp = generateOtp();
    await saveOtpToUser(user, otp, "forgot-password");

    res.status(200).json({
      success: true,
      requiresOtp: true,
      purpose: "forgot-password",
      email: user.email,
      message: genericMessage,
      ...attachOtpToResponse(otp),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password after forgot-password OTP was verified
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and new password");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: { $ne: null },
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("OTP verification required. Please verify OTP first.");
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
