/**
 * routes/budgetRoutes.js
 * Protected budget planner endpoints.
 * Mounts at /api/budgets in server.js.
 */

import express from "express";
import {
  setBudget,
  getBudgets,
  deleteBudget,
} from "../controllers/budgetController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", setBudget);
router.get("/", getBudgets);
router.delete("/:id", deleteBudget);

export default router;
