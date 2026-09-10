/**
 * routes/paymentMethodRoutes.js
 * Payment method management API — all routes require authentication.
 */

import express from "express";
import {
  getPaymentMethods,
  getPaymentMethodOptions,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentMethodController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/options", getPaymentMethodOptions);
router.get("/", getPaymentMethods);
router.post("/", createPaymentMethod);
router.put("/:id", updatePaymentMethod);
router.delete("/:id", deletePaymentMethod);

export default router;
