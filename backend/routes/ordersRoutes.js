import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
  deleteOrder,
  updatePaymentandOrderStatus,
} from "../controllers/OrdersController.js";
import uploadPaymentScreenshot from "../middleware/paymentsScreenShots.js";

const router = Router();

router.post("/", uploadPaymentScreenshot, createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.get("/user/:user_id", getOrdersByUserId);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.patch("/update-status/:id", updatePaymentandOrderStatus);

export default router;