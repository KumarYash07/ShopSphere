import express from "express";

import {
  createProduct,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("host"),
  createProduct
);

export default router;