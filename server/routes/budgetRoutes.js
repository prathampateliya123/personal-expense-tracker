import express from "express";
import {
  getBudgets,
  getBudgetCurrent,
  upsertBudget,
  deleteBudget,
  copyBudget,
} from "../controllers/budgetController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/current", getBudgetCurrent);
router.get("/", getBudgets);
router.put("/", upsertBudget);
router.post("/copy", copyBudget);
router.delete("/:id", deleteBudget);

export default router;
