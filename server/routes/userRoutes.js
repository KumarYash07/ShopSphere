import express from "express";

import {
  getMyProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getMyProfile);
router.get("/preferences", protect, getNotificationPreferences);
router.put("/preferences", protect, updateNotificationPreferences);

export default router;