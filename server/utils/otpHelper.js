/**
 * utils/otpHelper.js
 * Generate and verify 6-digit OTP codes.
 */

import crypto from "crypto";

const OTP_EXPIRE_MS = 10 * 60 * 1000; // 10 minutes

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

export const saveOtpToUser = async (user, otp, purpose) => {
  user.otp = hashOtp(otp);
  user.otpExpire = new Date(Date.now() + OTP_EXPIRE_MS);
  user.otpPurpose = purpose;
  await user.save();
};

export const verifyUserOtp = (user, otp, purpose) => {
  if (!user?.otp || !user?.otpExpire || user.otpPurpose !== purpose) {
    return false;
  }

  if (user.otpExpire.getTime() < Date.now()) {
    return false;
  }

  return user.otp === hashOtp(otp);
};

export const clearUserOtp = (user) => {
  user.otp = null;
  user.otpExpire = null;
  user.otpPurpose = null;
};

/** Include OTP in API response (for dev / testing without email SMS) */
export const attachOtpToResponse = (otp) => ({
  otp,
  message: "OTP sent. Use the code below to verify.",
});
