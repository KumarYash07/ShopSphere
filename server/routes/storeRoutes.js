import express from "express";

import {
  createStore,
  getMyStore,
  updateMyStore,
} from "../controllers/storeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("host"),
  createStore
);

router.get(
  "/my-store",
  protect,
  authorize("host"),
  getMyStore
);

router.put(
  "/my-store",
  protect,
  authorize("host"),
  updateMyStore
);

export default router;