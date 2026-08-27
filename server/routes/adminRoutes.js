import express from "express";

import {
  getAdminStats,
  getPendingHosts,
  getAllHosts,
  getHostDetails,
  updateHostStatus,
  getAllStores,
  getStoreDetails,
  updateStoreStatus,
  getAllProductsForAdmin,
  getAdminProductDetails,
  updateProductStatusByAdmin,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/hosts/pending",
  protect,
  authorize("admin"),
  getPendingHosts
);

router.patch(
  "/hosts/:id/status",
  protect,
  authorize("admin"),
  updateHostStatus
);

router.get(
  "/stats",
  protect,
  authorize("admin"),
  getAdminStats
);

// Dashboard stats
router.get(
  "/stats",
  protect,
  authorize("admin"),
  getAdminStats
);

// All hosts
router.get(
  "/hosts",
  protect,
  authorize("admin"),
  getAllHosts
);

// Pending hosts
router.get(
  "/hosts/pending",
  protect,
  authorize("admin"),
  getPendingHosts
);

// Particular host
router.get(
  "/hosts/:id",
  protect,
  authorize("admin"),
  getHostDetails
);

// Approve / block host
router.patch(
  "/hosts/:id/status",
  protect,
  authorize("admin"),
  updateHostStatus
);


// All stores
router.get(
  "/stores",
  protect,
  authorize("admin"),
  getAllStores
);

// Store details
router.get(
  "/stores/:id",
  protect,
  authorize("admin"),
  getStoreDetails
);

// Update store status
router.patch(
  "/stores/:id/status",
  protect,
  authorize("admin"),
  updateStoreStatus
);

// All products
router.get(
  "/products",
  protect,
  authorize("admin"),
  getAllProductsForAdmin
);

// Product details
router.get(
  "/products/:id",
  protect,
  authorize("admin"),
  getAdminProductDetails
);

// Activate / deactivate product
router.patch(
  "/products/:id/status",
  protect,
  authorize("admin"),
  updateProductStatusByAdmin
);

export default router;