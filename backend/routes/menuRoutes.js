import { Router } from "express";
import {
  createMenu,
  createSubMenu,
  getAllMenusWithSubMenu,
  deleteMenu,
  updateSubMenu,
  deleteSubMenu
} from "../controllers/menuController.js";

const router = Router();

// Menu (Parent) Routes
router.post("/", createMenu);
router.get("/combined", getAllMenusWithSubMenu); 
router.delete("/:id", deleteMenu);

// Submenu (Child) Routes
router.post("/submenu", createSubMenu);
router.put("/submenu/:id", updateSubMenu);
router.delete("/submenu/:id", deleteSubMenu);

export default router;