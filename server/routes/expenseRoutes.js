/**
 * routes/expenseRoutes.js
 * Protected expense CRUD endpoints.
 * Mounts at /api/expenses in server.js.
 */

import express from "express";
import {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All expense routes require authentication
router.use(protect);

router.post("/", addExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
