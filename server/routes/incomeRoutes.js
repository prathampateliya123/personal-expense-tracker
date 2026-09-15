import express from "express";
import {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeStats,
} from "../controllers/incomeController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.post("/", addIncome);
router.get("/stats", getIncomeStats);
router.get("/", getIncomes);
router.get("/:id", getIncomeById);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;
