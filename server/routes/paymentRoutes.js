import express from "express";

import {
    createDemoPayment,
    verifyDemoPayment,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/demo/create",
    protect,
    createDemoPayment
);

router.post(
    "/demo/verify",
    protect,
    verifyDemoPayment
);

export default router;