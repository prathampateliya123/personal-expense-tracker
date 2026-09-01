/**
 * utils/jwtToken.js
 * JWT generation and httpOnly cookie helpers.
 * Token is stored ONLY in cookies — never sent in response body.
 */

import jwt from "jsonwebtoken";

const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Shared cookie options — must match for set and clear */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

/**
 * Sign a JWT for the given user id.
 */
export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

/**
 * Set JWT in httpOnly cookie after login / register.
 */
export const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE_MS,
  });
};

/**
 * Remove JWT cookie on logout or invalid session.
 */
export const clearTokenCookie = (res) => {
  res.cookie("token", "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
};

/**
 * Verify JWT from cookie string. Returns decoded payload or null.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
