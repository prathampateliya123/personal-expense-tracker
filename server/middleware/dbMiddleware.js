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
        "Database not connected. Open server/.env and set MONGO_PASSWORD to your MongoDB Atlas password, then restart the server.",
    });
    return;
  }

  next();
};

export default requireDb;
