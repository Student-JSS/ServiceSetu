import express from "express";
import {
  getMyProfile,
  toggleAvailability,
  updateLocation,
  updateSchedule,
  updateWelfareAndBank,
  getEarningsHistory,
  uploadDocuments,
} from "../controllers/workerController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/me", protect, authorize("worker"), getMyProfile);
router.patch("/availability", protect, authorize("worker"), toggleAvailability);
router.patch("/location", protect, authorize("worker"), updateLocation);
router.patch("/schedule", protect, authorize("worker"), updateSchedule);
router.patch("/welfare", protect, authorize("worker"), updateWelfareAndBank);
router.get("/earnings", protect, authorize("worker"), getEarningsHistory);
router.post("/documents", protect, authorize("worker"), upload.single("document"), uploadDocuments);

export default router;
