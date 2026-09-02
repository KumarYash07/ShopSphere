import express from "express";

import {
    getHostOrders,
    getHostOrderById,
    updateHostOrderStatus,
    getHostRevenueStats,
} from "../controllers/hostOrderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(
    protect,
    authorize("host")
);

router.get(
    "/",
    getHostOrders
);

router.get(
    "/revenue",
    protect,
    authorize("host"),
    getHostRevenueStats
);

router.get(
    "/:id",
    getHostOrderById
);

router.put(
    "/:id/status",
    updateHostOrderStatus
);

export default router;