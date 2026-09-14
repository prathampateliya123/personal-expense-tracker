/**
 * routes/index.js
 * Mount all API route modules.
 */

import { Router } from "express";
import authRoutes from "./authRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import incomeRoutes from "./incomeRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import paymentMethodRoutes from "./paymentMethodRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/incomes", incomeRoutes);
router.use("/categories", categoryRoutes);
router.use("/payment-methods", paymentMethodRoutes);

export default router;
