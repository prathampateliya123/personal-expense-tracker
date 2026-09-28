import crypto from "crypto";

const OTP_EXPIRE_MS = 10 * 60 * 1000;

export const generateOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

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

export const attachOtpToResponse = (otp) => {
  const exposeOtp =
    process.env.EXPOSE_OTP === "true" ||
    process.env.NODE_ENV !== "production";

  if (!exposeOtp) {
    return {
      message: "OTP sent. Check your email to verify.",
    };
  }

  return {
    otp,
    message: "OTP sent. Use the code below to verify.",
  };
};
