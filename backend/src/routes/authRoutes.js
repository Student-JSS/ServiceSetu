import express from "express";
import {
  updateProfile,
  sendOtp,
  verifyOtp,
  adminLogin,
  universalLogin,
  getPublicCooperatives,
  registerWorker,
  registerCustomer,
  getMe,
  updateLanguage,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/admin-login", adminLogin);
router.post("/login", universalLogin);
router.post("/register-customer", registerCustomer);
router.get("/cooperatives", getPublicCooperatives);
router.post(
  "/register-worker",
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "skillCert", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  registerWorker
);
router.get("/me", protect, getMe);
router.patch("/language", protect, updateLanguage);

router.patch("/profile", protect, updateProfile);

export default router;
