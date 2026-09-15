import jwt from "jsonwebtoken";

const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;


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
