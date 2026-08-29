import express from "express";

import {
  registerUser,
  verifyEmail,
  loginUser,
  requestEmailChange,
  verifyEmailChange,
  updateProfile,
  changePassword,
  createPassword,
  googleAuth,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);

router.post("/login", loginUser);

router.post("/google", googleAuth);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);
router.post("/create-password", protect, createPassword);

router.post(
  "/change-email/request",
  protect,
  requestEmailChange
);

router.post(
  "/change-email/verify",
  protect,
  verifyEmailChange
);

export default router;