import { Router } from "express";
import authRoutes from "./authRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import incomeRoutes from "./incomeRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import paymentMethodRoutes from "./paymentMethodRoutes.js";
import budgetRoutes from "./budgetRoutes.js";
import savingRoutes from "./savingRoutes.js";
import investmentRoutes from "./investmentRoutes.js";
import subscriptionRoutes from "./subscriptionRoutes.js";
import billSimulationRoutes from "./billSimulationRoutes.js";
import tripRoutes from "./tripRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/incomes", incomeRoutes);
router.use("/categories", categoryRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/budgets", budgetRoutes);
router.use("/savings", savingRoutes);
router.use("/investments", investmentRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/bill-simulations", billSimulationRoutes);
router.use("/trips", tripRoutes);

export default router;
