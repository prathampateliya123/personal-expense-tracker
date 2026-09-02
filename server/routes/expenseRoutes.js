/**
 * routes/expenseRoutes.js
 * Expense management API — all routes require authentication.
 */

import express from "express";
import {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from "../controllers/expenseController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.post("/", addExpense);
router.get("/stats", getExpenseStats);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
