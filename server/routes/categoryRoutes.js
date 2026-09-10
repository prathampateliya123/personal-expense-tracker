/**
 * routes/categoryRoutes.js
 * Category management API — all routes require authentication.
 */

import express from "express";
import {
  getCategories,
  getCategoryOptions,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import protect from "../middleware/authMiddleware.js";
import requireDb from "../middleware/dbMiddleware.js";

const router = express.Router();

router.use(protect, requireDb);

router.get("/options", getCategoryOptions);
router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
