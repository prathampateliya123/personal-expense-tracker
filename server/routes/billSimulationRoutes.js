import express from "express";
import {
  calculateBill,
  getBillSimulations,
  getBillSimulationStats,
  getBillSimulationById,
  createBillSimulation,
  updateBillSimulation,
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
router.get("/:id", getBillSimulationById);
router.put("/:id", updateBillSimulation);
router.delete("/:id", deleteBillSimulation);

export default router;
