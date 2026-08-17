import express from "express";

import {
  registerUser,
  verifyEmail,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);

router.post("/login", loginUser);

export default router;