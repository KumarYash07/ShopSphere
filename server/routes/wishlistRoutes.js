import express from "express";

import {
    getMyWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
} from "../controllers/wishlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All wishlist routes require login

// Get current user's wishlist
router.get(
    "/",
    protect,
    getMyWishlist
);

// Add product to wishlist
router.post(
    "/",
    protect,
    addToWishlist
);

// Check whether product is wishlisted
router.get(
    "/check/:productId",
    protect,
    checkWishlist
);

// Remove product from wishlist
router.delete(
    "/:productId",
    protect,
    removeFromWishlist
);

export default router;