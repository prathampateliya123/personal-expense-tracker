/**
 * routes/investmentRoutes.js
 * Protected investment tracking endpoints.
 * Mounts at /api/investments in server.js.
 */

import express from "express";
import {
  addInvestment,
  getInvestments,
  updateInvestment,
  deleteInvestment,
} from "../controllers/investmentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addInvestment);
router.get("/", getInvestments);
router.put("/:id", updateInvestment);
router.delete("/:id", deleteInvestment);

export default router;
