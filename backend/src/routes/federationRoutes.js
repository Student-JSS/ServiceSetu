import express from "express";
import {
  getFederationOverview,
  updatePlatformFee,
  getDemandForecasting,
  getWorkforceAllocation,
  broadcastFederation,
} from "../controllers/federationController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/overview", protect, authorize("fed_admin"), getFederationOverview);
router.patch("/fee", protect, authorize("fed_admin"), updatePlatformFee);
router.get("/demand-forecasting", protect, authorize("fed_admin", "coop_admin"), getDemandForecasting);
router.get("/workforce-allocation", protect, authorize("fed_admin", "coop_admin"), getWorkforceAllocation);
router.post("/broadcast", protect, authorize("fed_admin"), broadcastFederation);

export default router;
