import express from "express";
import {
  calculateBill,
  getBillSimulations,
  getBillSimulationStats,
  createBillSimulation,
  deleteBillSimulation,
} from "../controllers/billSimulationController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.post("/calculate", calculateBill);
router.get("/stats", getBillSimulationStats);
router.get("/", getBillSimulations);
router.post("/", createBillSimulation);
router.delete("/:id", deleteBillSimulation);

export default router;
