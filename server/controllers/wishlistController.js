import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";


// ======================================================
// GET MY WISHLIST
// ======================================================

export const getMyWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({
            user: req.user._id,
        })
            .populate({
                path: "product",
                select:
                    "name slug brand images price finalPrice discount stock rating totalReviews status store seller category",
            })
            .sort({ createdAt: -1 });

        // Remove wishlist entries whose product no longer exists
        const validWishlist = wishlist.filter(
            (item) => item.product !== null
        );

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist.map((item) => item.product),
        });
    } catch (error) {
        console.error("Get Wishlist Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching wishlist.",
        });
    }
};


// ======================================================
// ADD PRODUCT TO WISHLIST
// ======================================================

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

        // Check product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // Only active products can be added
        if (product.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "This product is not available.",
            });
        }

        // Check duplicate
        const existingWishlist = await Wishlist.findOne({
            user: req.user._id,
            product: productId,
        });

        if (existingWishlist) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist.",
            });
        }

        // Create wishlist entry
        const wishlistItem = await Wishlist.create({
            user: req.user._id,
            product: productId,
        });

        // Return product data
        const populatedWishlistItem =
            await Wishlist.findById(wishlistItem._id).populate({
                path: "product",
                select:
                    "name slug brand images price finalPrice discount stock rating totalReviews status store seller category",
            });

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist.",
            wishlistItem:
                populatedWishlistItem.product,
        });
    } catch (error) {
        // Handle duplicate index race condition
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist.",
            });
        }

        console.error("Add Wishlist Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding product to wishlist.",
        });
    }
};


// ======================================================
// REMOVE PRODUCT FROM WISHLIST
// ======================================================

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

        const wishlistItem = await Wishlist.findOneAndDelete({
            user: req.user._id,
            product: productId,
        });

        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your wishlist.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist.",
            productId,
        });
    } catch (error) {
        console.error("Remove Wishlist Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while removing product from wishlist.",
        });
    }
};


// ======================================================
// CHECK IF PRODUCT IS WISHLISTED
// ======================================================

export const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

        const wishlistItem = await Wishlist.findOne({
            user: req.user._id,
            product: productId,
        });

        return res.status(200).json({
            success: true,
            isWishlisted: !!wishlistItem,
        });
    } catch (error) {
        console.error("Check Wishlist Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while checking wishlist.",
        });
    }
};