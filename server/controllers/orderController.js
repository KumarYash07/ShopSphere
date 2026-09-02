import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

import { generateOrderNumber } from "../utils/generateOrderNumber.js";


// Create Order
export const createOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod } = req.body;

        // 1. Validate input
        if (!addressId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Address and payment method are required.",
            });
        }

        // 2. Validate payment method
        // Razorpay/online payment is not enabled yet
        if (!["cod", "demo"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method.",
            });
        }

        // 3. Get user's cart
        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty.",
            });
        }

        // 4. Get user's address
        const address = await Address.findOne({
            _id: addressId,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Shipping address not found.",
            });
        }

        // 5. Fetch fresh products from database
        const productIds = cart.items.map(
            (item) => item.product
        );

        const products = await Product.find({
            _id: { $in: productIds },
        });

        // 6. Validate products and calculate total
        const orderItems = [];
        let subtotal = 0;

        for (const cartItem of cart.items) {
            const product = products.find(
                (p) =>
                    p._id.toString() ===
                    cartItem.product.toString()
            );

            // Product doesn't exist
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more products no longer exist.",
                });
            }

            // Product is inactive/out of stock
            if (product.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message:
                        `${product.name} is no longer available.`,
                });
            }

            // Insufficient stock
            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.stock} units of ${product.name} are available.`,
                });
            }

            // Calculate item total using fresh DB price
            const itemTotal =
                product.finalPrice * cartItem.quantity;

            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                store: product.store,
                seller: product.seller,
                productName: product.name,
                productImage:
                    product.images?.[0] || null,
                quantity: cartItem.quantity,
                price: product.finalPrice,
                total: itemTotal,
            });
        }

        // 7. Calculate shipping
        const shippingFee =
            subtotal >= 999 ? 0 : 49;

        // Currently no coupon/discount system
        const discount = 0;

        const totalAmount =
            subtotal + shippingFee - discount;

        // 8. Create order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),

            user: req.user._id,

            items: orderItems,

            shippingAddress: {
                fullName: address.fullName,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                landmark: address.landmark,
                addressType: address.addressType,
            },

            subtotal,
            shippingFee,
            discount,
            totalAmount,

            paymentMethod,

            // Payment happens after order creation
            paymentStatus: "pending",

            orderStatus: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            order,
        });

    } catch (error) {
        console.error("Create Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating order.",
        });
    }
};


// Get user's orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
        })
            .populate(
                "items.product",
                "name images"
            )
            .populate(
                "items.store",
                "storeName"
            )
            .populate(
                "items.seller",
                "firstName lastName email"
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error("Get My Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching orders.",
        });
    }
};


// Get single order
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: req.user._id,
        })
            .populate(
                "items.product",
                "name images"
            )
            .populate(
                "items.store",
                "storeName"
            )
            .populate(
                "items.seller",
                "firstName lastName email"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.error("Get Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching order.",
        });
    }
};


// Cancel Order
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Find order belonging to logged-in user
        const order = await Order.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // Customer can cancel until shipped
        const cancellableStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
        ];

        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message:
                    `Order cannot be cancelled because it is already ${order.orderStatus}.`,
            });
        }

        // ==========================================
        // Cancel Order
        // ==========================================

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();

        order.cancellationReason =
            reason?.trim() || "Cancelled by customer";

        // ==========================================
        // Payment Handling
        // ==========================================

        // COD:
        // Payment has not been collected yet,
        // so keep paymentStatus as pending.

        // DEMO / ONLINE:
        // If payment was already made, mark it refunded.
        if (
            order.paymentStatus === "paid" &&
            order.paymentMethod !== "cod"
        ) {
            order.paymentStatus = "refunded";
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",

            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                cancelledAt: order.cancelledAt,
                cancellationReason: order.cancellationReason,
            },
        });

    } catch (error) {
        console.error("Cancel Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while cancelling order.",
        });
    }
};