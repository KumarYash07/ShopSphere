import express from "express";

import {
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    getRevenueStats,
} from "../controllers/adminOrderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// All routes require login + admin role
router.use(protect, adminOnly);


// Get all orders
router.get("/", getAllOrders);


// Revenue statistics
router.get("/revenue", getRevenueStats);


// Get single order
router.get("/:id", getAdminOrderById);


// Update order status
router.put("/:id/status", updateOrderStatus);


export default router;