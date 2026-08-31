/**
 * routes/tripRoutes.js
 * Protected trip expense management endpoints.
 * Mounts at /api/trips in server.js.
 */

import express from "express";
import {
  createTrip,
  getTrips,
  getTripDetails,
  updateTrip,
  deleteTrip,
  closeTrip,
} from "../controllers/tripController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTripDetails);
router.patch("/:id/close", closeTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

export default router;
