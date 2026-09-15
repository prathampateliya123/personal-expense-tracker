/**
 * routes/investmentRoutes.js
 */

import express from "express";
import {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentStats,
  getInvestmentTypes,
} from "../controllers/investmentController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/stats", getInvestmentStats);
router.get("/types", getInvestmentTypes);
router.get("/", getInvestments);
router.post("/", createInvestment);
router.get("/:id", getInvestmentById);
router.put("/:id", updateInvestment);
router.delete("/:id", deleteInvestment);

export default router;
