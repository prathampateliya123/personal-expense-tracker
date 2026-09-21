import express from "express";
import {
  getSubscriptions,
  getSubscriptionById,
  getSubscriptionStats,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "../controllers/subscriptionController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/stats", getSubscriptionStats);
router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.post("/:id/pause", pauseSubscription);
router.post("/:id/resume", resumeSubscription);
router.post("/:id/cancel", cancelSubscription);
router.get("/:id", getSubscriptionById);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

export default router;
