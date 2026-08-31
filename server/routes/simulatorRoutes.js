/**
 * routes/simulatorRoutes.js
 * Protected what-if simulator endpoints (calculation only, no DB writes).
 * Mounts at /api/simulator in server.js.
 */

import express from "express";
import {
  simulateCut,
  simulateSavingsRate,
} from "../controllers/simulatorController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/simulate-cut", simulateCut);
router.post("/simulate-savings-rate", simulateSavingsRate);

export default router;
