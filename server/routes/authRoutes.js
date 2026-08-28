import express from "express";

import {
  registerUser,
  verifyEmail,
  loginUser,
  requestEmailChange,
  verifyEmailChange,
  updateProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);

router.post("/login", loginUser);

router.put("/profile", protect, updateProfile);

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