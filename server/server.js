import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB, { isDbConnected } from "./config/db.js";
import corsOptions from "./config/cors.js";
import apiRoutes from "./routes/index.js";
import errorHandler from "./middleware/errorMiddleware.js";
import { startSubscriptionCron } from "./cron/subscriptionCron.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    database: isDbConnected() ? "connected" : "disconnected",
  });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
  startSubscriptionCron();
});
