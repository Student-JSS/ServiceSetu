import express from "express";
import {
  getAllServices,
  getCategories,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/categories", getCategories);
router.post("/", protect, authorize("coop_admin", "fed_admin"), createService);
router.patch("/:id", protect, authorize("coop_admin", "fed_admin"), updateService);
router.delete("/:id", protect, authorize("coop_admin", "fed_admin"), deleteService);

export default router;
