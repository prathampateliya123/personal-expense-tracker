/**
 * server.js
 * Express application entry point.
 * Connects to MongoDB, configures middleware, mounts routes, and starts the server.
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import simulatorRoutes from "./routes/simulatorRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import timelineRoutes from "./routes/timelineRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import { startDailyChecks } from "./cron/dailyChecks.js";
import { startSubscriptionCron } from "./cron/subscriptionCron.js";

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Request logging
app.use(morgan("dev"));

// CORS — allow credentials (cookies) from the client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body parsing and cookie middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/trips", tripRoutes);

// Start scheduled daily checks (budget alerts, subscriptions, etc.)
startDailyChecks();
startSubscriptionCron();

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
