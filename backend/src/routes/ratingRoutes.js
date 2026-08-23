import express from "express";
import {
  submitRating,
  getWorkerRatings,
  flagRating,
} from "../controllers/ratingController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, submitRating);
router.get("/worker/:workerId", getWorkerRatings);
router.patch("/:id/flag", protect, authorize("coop_admin", "fed_admin"), flagRating);

export default router;
