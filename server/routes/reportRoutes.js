import express from "express";
import {
  getReportSummary,
  exportReportCsv,
} from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/summary", getReportSummary);
router.get("/export.csv", exportReportCsv);

export default router;
