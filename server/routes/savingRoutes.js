import express from "express";
import {
  getSavings,
  getSavingById,
  createSaving,
  updateSaving,
  deleteSaving,
  contributeSaving,
  withdrawSaving,
  getSavingStats,
} from "../controllers/savingController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/stats", getSavingStats);
router.get("/", getSavings);
router.post("/", createSaving);
router.post("/:id/contribute", contributeSaving);
router.post("/:id/withdraw", withdrawSaving);
router.get("/:id", getSavingById);
router.put("/:id", updateSaving);
router.delete("/:id", deleteSaving);

export default router;
