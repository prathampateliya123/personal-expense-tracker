/**
 * routes/reportRoutes.js
 * Protected report export and summary endpoints.
 * Mounts at /api/reports in server.js.
 */

import express from "express";
import {
  exportExcel,
  exportPdf,
  monthlySummary,
} from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/export/excel", exportExcel);
router.get("/export/pdf", exportPdf);
router.get("/monthly-summary", monthlySummary);

export default router;
