/**
 * routes/timelineRoutes.js
 * Protected expense timeline, memory, and heatmap endpoints.
 * Mounts at /api/timeline in server.js.
 */

import express from "express";
import {
  getTimeline,
  getMemories,
  getHeatmap,
} from "../controllers/timelineController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/timeline", getTimeline);
router.get("/memories", getMemories);
router.get("/heatmap", getHeatmap);

export default router;
