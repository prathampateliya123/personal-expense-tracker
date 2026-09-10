/**
 * routes/index.js
 * Mount all API route modules.
 */

import { Router } from "express";
import authRoutes from "./authRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import categoryRoutes from "./categoryRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/categories", categoryRoutes);

export default router;
