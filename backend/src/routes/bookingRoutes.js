import express from "express";
import {
  getBookingChat,
  postBookingChat,
  findNearbyWorkers,
  createBooking,
  createEmergencyBroadcast,
  acceptBooking,
  updateBookingStatus,
  cancelBooking,
  workerCancelBooking,
  getMyBookings,
  getBookingDetails,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/nearby-workers", findNearbyWorkers);
router.post("/", protect, createBooking);
router.post("/emergency", protect, createEmergencyBroadcast);
router.patch("/:id/accept", protect, authorize("worker"), acceptBooking);
router.patch("/:id/status", protect, updateBookingStatus);
router.patch("/:id/cancel", protect, cancelBooking);
router.patch("/:id/worker-cancel", protect, authorize("worker"), workerCancelBooking);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingDetails);

router.get("/:id/chat", protect, getBookingChat);
router.post("/:id/chat", protect, postBookingChat);

export default router;
