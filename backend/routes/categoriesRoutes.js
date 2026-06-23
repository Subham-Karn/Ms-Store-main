import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
} from "../controllers/CategoriesController.js";

const router = Router();

// POST: Create Parent or Subcategory (use parentId in body for sub)
router.post("/", createCategory);

// GET: Fetch all categories nested (Parent + Subcategories)
router.get("/", getAllCategories);

// PUT: Update category by ID
router.put("/:id", updateCategory);

// DELETE: Delete category and its subcategories
router.delete("/:id", deleteCategory);

export default router;