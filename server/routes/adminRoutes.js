import express from "express";

import { adminTest } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/test",
  protect,
  authorize("admin"),
  adminTest
);

export default router;