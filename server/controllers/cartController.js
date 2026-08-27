import Cart from "../models/Cart.js";
import Product from "../models/Product.js";


// Get user's cart
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.user._id,
        }).populate(
            "items.product",
            "name images price finalPrice stock status store seller"
        );

        // Create empty cart if it doesn't exist
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [],
                totalAmount: 0,
            });
        }

        return res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        console.error("Get Cart Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching cart.",
        });
    }
};


// Add product to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required.",
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1.",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        if (product.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "This product is not available.",
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available.`,
            });
        }

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [],
                totalAmount: 0,
            });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items are available.`,
                });
            }

            existingItem.quantity = newQuantity;
            existingItem.price = product.finalPrice;
        } else {
            cart.items.push({
                product: product._id,
                quantity,
                price: product.finalPrice,
            });
        }

        cart.totalAmount = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        await cart.populate(
            "items.product",
            "name images price finalPrice stock status store seller"
        );

        return res.status(200).json({
            success: true,
            message: "Product added to cart.",
            cart,
        });
    } catch (error) {
        console.error("Add To Cart Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding product to cart.",
        });
    }
};


// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1.",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available.`,
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart.",
            });
        }

        item.quantity = quantity;
        item.price = product.finalPrice;

        cart.totalAmount = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        await cart.populate(
            "items.product",
            "name images price finalPrice stock status store seller"
        );

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully.",
            cart,
        });
    } catch (error) {
        console.error("Update Cart Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating cart.",
        });
    }
};


// Remove product from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        const itemExists = cart.items.some(
            (item) => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart.",
            });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        cart.totalAmount = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart.",
            cart,
        });
    } catch (error) {
        console.error("Remove From Cart Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while removing product.",
        });
    }
};


// Clear cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        cart.items = [];
        cart.totalAmount = 0;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully.",
            cart,
        });
    } catch (error) {
        console.error("Clear Cart Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while clearing cart.",
        });
    }
};