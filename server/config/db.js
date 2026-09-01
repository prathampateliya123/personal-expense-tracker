/**
 * config/db.js
 * MongoDB connection with retry — server stays up even if DB is temporarily down.
 */

import mongoose from "mongoose";

let retryTimer = null;

export const isDbConnected = () => mongoose.connection.readyState === 1;

const scheduleRetry = () => {
  if (retryTimer) return;

  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectDB();
  }, 5000);
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI missing in server/.env");
    scheduleRetry();
    return;
  }

  if (uri.includes("YOUR_DB_PASSWORD")) {
    console.error(
      "Replace YOUR_DB_PASSWORD in server/.env with your real MongoDB Atlas password"
    );
    scheduleRetry();
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Helps avoid querySrv DNS issues on some Windows networks
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log("Retrying MongoDB in 5 seconds...");
    scheduleRetry();
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected — retrying...");
  scheduleRetry();
});

export default connectDB;
