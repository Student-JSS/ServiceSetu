import express from "express";
import {
  createGrievance,
  getMyGrievances,
  getCoopGrievances,
  resolveGrievance,
} from "../controllers/grievanceController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, authorize("worker"), createGrievance);
router.get("/my", protect, authorize("worker"), getMyGrievances);
router.get("/coop", protect, authorize("coop_admin", "fed_admin"), getCoopGrievances);
router.patch("/:id/resolve", protect, authorize("coop_admin", "fed_admin"), resolveGrievance);

export default router;
