import jwt from "jsonwebtoken";

const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

const parseDurationToMs = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value * 1000;
  }

  const raw = String(value || "").trim();
  if (!raw) return 7 * 24 * 60 * 60 * 1000;

  if (/^\d+$/.test(raw)) {
    return Number(raw) * 1000;
  }

  const match = raw.match(/^(\d+)\s*([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const COOKIE_MAX_AGE_MS = parseDurationToMs(JWT_EXPIRE);

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

export const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE_MS,
  });
};

export const clearTokenCookie = (res) => {
  res.cookie("token", "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
