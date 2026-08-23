import express from "express";
import {
  getCoopStats,
  getCoopWorkers,
  verifyWorkerKYC,
  manualAssignWorker,
  updateWorkerInsurance,
  broadcastToWorkers,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/stats", protect, authorize("coop_admin", "fed_admin"), getCoopStats);
router.get("/workers", protect, authorize("coop_admin", "fed_admin"), getCoopWorkers);
router.patch("/workers/:workerId/verify", protect, authorize("coop_admin", "fed_admin"), verifyWorkerKYC);
router.post("/assign-worker", protect, authorize("coop_admin", "fed_admin"), manualAssignWorker);
router.patch("/workers/:workerId/insurance", protect, authorize("coop_admin", "fed_admin"), updateWorkerInsurance);
router.post("/broadcast", protect, authorize("coop_admin", "fed_admin"), broadcastToWorkers);

export default router;
