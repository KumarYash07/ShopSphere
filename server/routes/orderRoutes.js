import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my", protect, getMyOrders);

router.put("/:id/cancel", protect, cancelOrder);

router.get("/:id", protect, getOrderById);

export default router;