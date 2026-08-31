/**
 * routes/goalRoutes.js
 * Protected savings goal endpoints.
 * Mounts at /api/goals in server.js.
 */

import express from "express";
import {
  createGoal,
  getGoals,
  addContribution,
  updateGoal,
  deleteGoal,
  markGoalComplete,
} from "../controllers/goalController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createGoal);
router.get("/", getGoals);
router.post("/:id/contribute", addContribution);
router.patch("/:id/complete", markGoalComplete);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
