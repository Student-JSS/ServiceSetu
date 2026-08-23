import express from "express";
import {
  createOrder,
  verifyPayment,
  selectCOD,
  markCODCollected,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/cod", protect, selectCOD);
router.post("/cod-collected", protect, markCODCollected);

export default router;
