/**
 * routes/subscriptionRoutes.js
 * Protected subscription management endpoints.
 * Mounts at /api/subscriptions in server.js.
 */

import express from "express";
import {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
} from "../controllers/subscriptionController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createSubscription);
router.get("/", getSubscriptions);
router.patch("/:id/cancel", cancelSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

export default router;
