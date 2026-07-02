import { Router } from "express";
import multer from "multer";
import {
  addProducts,
  addBulkProducts,
  bulkDeleteProducts,
  productsUpdate,
  deleteProduct,
  updateSKUID,
  getAllProducts,
  getProductById,
  updateStock,
} from "../controllers/ProductsControllers.js";
import uploadImagesForProducts from "../middleware/uploadsImages.js";
console.log("PRODUCT ROUTES LOADED");
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const productImagesConfig = [
  { name: "bunner", maxCount: 1 },
  { name: "thumbnails", maxCount: 5 },
];

// --- Product Routes ---
router.post(
  "/", 
  ...uploadImagesForProducts(productImagesConfig), 
  addProducts
);

// POST /api/products/bulk
router.post("/bulk",  addBulkProducts);

// GET /api/products
router.get("/", getAllProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

// PUT /api/products/:id
router.put(
  "/:id", 
  ...uploadImagesForProducts(productImagesConfig), 
  productsUpdate
);

// DELETE /api/products/:id
router.delete("/bulk-delete", bulkDeleteProducts);
router.delete("/:id", deleteProduct);

// PUT /api/products/update-sku/:id
router.put("/update-sku/:id", updateSKUID);

// PUT /api/products/update-stock/:id
router.put("/update-stock/:id", updateStock);

export default router;