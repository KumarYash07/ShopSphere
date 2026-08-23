import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock,
  updateProductDiscount,
  uploadProductImages,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Host
router.post(
  "/",
  protect,
  authorize("host"),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("host"),
  updateProduct
);

router.patch(
  "/:id/stock",
  protect,
  authorize("host"),
  updateProductStock
);

router.patch(
  "/:id/discount",
  protect,
  authorize("host"),
  updateProductDiscount
);

router.post(
  "/:id/images",
  protect,
  authorize("host"),
  upload.array("images", 5),
  uploadProductImages
);

router.delete(
  "/:id",
  protect,
  authorize("host"),
  deleteProduct
);

export default router;