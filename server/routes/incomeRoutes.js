/**
 * routes/incomeRoutes.js
 * Protected income CRUD endpoints.
 * Mounts at /api/incomes in server.js.
 */

import express from "express";
import {
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} from "../controllers/incomeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All income routes require authentication
router.use(protect);

router.post("/", addIncome);
router.get("/", getIncomes);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;
