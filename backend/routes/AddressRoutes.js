import { Router } from "express";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  changeDefaultAddress,
  getAddressesByUserId,
} from "../controllers/AddressController.js";

const router = Router();

router.post("/", createAddress);
router.get("/:user_id", getAddressesByUserId);
router.put("/:address_id", updateAddress);
router.delete("/delete/:user_id/:address_id", deleteAddress);
router.put("/default/:user_id/:address_id", changeDefaultAddress);

export default router;