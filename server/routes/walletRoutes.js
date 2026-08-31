/**
 * routes/walletRoutes.js
 * Protected multi-wallet endpoints.
 * Mounts at /api/wallets in server.js.
 */

import express from "express";
import {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
  transferBetweenWallets,
} from "../controllers/walletController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createWallet);
router.get("/", getWallets);
router.post("/transfer", transferBetweenWallets);
router.put("/:id", updateWallet);
router.delete("/:id", deleteWallet);

export default router;
