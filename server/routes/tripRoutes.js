import express from "express";
import {
  getTripStats,
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addTripExpense,
  updateTripExpense,
  deleteTripExpense,
  recordTripSettlement,
  deleteTripSettlement,
} from "../controllers/tripController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/stats", getTripStats);
router.get("/", getTrips);
router.post("/", createTrip);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

router.post("/:id/expenses", addTripExpense);
router.put("/:id/expenses/:expenseId", updateTripExpense);
router.delete("/:id/expenses/:expenseId", deleteTripExpense);

router.post("/:id/settlements", recordTripSettlement);
router.delete("/:id/settlements/:settlementId", deleteTripSettlement);

export default router;
