/**
 * middleware/dbMiddleware.js
 * Blocks API routes when MongoDB is not connected.
 */

import { isDbConnected } from "../config/db.js";

const requireDb = (req, res, next) => {
  if (!isDbConnected()) {
    res.status(503).json({
      success: false,
      message:
        "Database not connected. Set your MongoDB Atlas password in server/.env (replace YOUR_DB_PASSWORD).",
    });
    return;
  }

  next();
};

export default requireDb;
