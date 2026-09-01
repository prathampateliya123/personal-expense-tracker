/**
 * middleware/authMiddleware.js
 * Reads JWT from httpOnly cookie, verifies it, attaches user to req.
 */

import User from "../models/User.js";
import { clearTokenCookie, verifyToken } from "../utils/jwtToken.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized — please log in");
    }

    const decoded = verifyToken(token);

    if (!decoded?.id) {
      clearTokenCookie(res);
      res.status(401);
      throw new Error("Session expired — please log in again");
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      clearTokenCookie(res);
      res.status(401);
      throw new Error("User not found — please log in again");
    }

    req.user = user;
    next();
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(401);
    }
    next(error);
  }
};

export default protect;
