import crypto from "crypto";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";


// Create Demo Payment
export const createDemoPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required.",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (order.paymentMethod !== "demo") {
            return res.status(400).json({
                success: false,
                message: "This order is not a demo payment order.",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order is already paid.",
            });
        }

        const transactionId =
            `DEMO-TXN-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

        return res.status(200).json({
            success: true,
            message: "Demo payment session created.",
            payment: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                amount: order.totalAmount,
                currency: "INR",
                transactionId,
            },
        });

    } catch (error) {
        console.error("Create Demo Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating demo payment.",
        });
    }
};


// Verify Demo Payment
export const verifyDemoPayment = async (req, res) => {
    try {
        const {
            orderId,
            transactionId,
            paymentResult,
        } = req.body;

        if (!orderId || !transactionId || !paymentResult) {
            return res.status(400).json({
                success: false,
                message:
                    "Order ID, transaction ID and payment result are required.",
            });
        }

        if (!["success", "failed"].includes(paymentResult)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment result.",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (order.paymentMethod !== "demo") {
            return res.status(400).json({
                success: false,
                message: "This is not a demo payment order.",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order is already paid.",
            });
        }

        // Payment failed
        if (paymentResult === "failed") {
            order.paymentStatus = "failed";

            await order.save();

            return res.status(200).json({
                success: false,
                message: "Demo payment failed.",
                paymentStatus: "failed",
            });
        }

        // Check stock again before successful payment
        for (const item of order.items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `${item.productName} is no longer available.`,
                });
            }

            if (product.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is no longer available.`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.stock} units of ${product.name} are available.`,
                });
            }
        }

        // Deduct stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);

            product.stock -= item.quantity;

            if (product.stock === 0) {
                product.status = "out_of_stock";
            }

            await product.save();
        }

        // Mark payment successful
        order.paymentStatus = "paid";
        order.paymentId = transactionId;
        order.orderStatus = "confirmed";

        await order.save();

        // Clear cart
        await Cart.findOneAndUpdate(
            {
                user: req.user._id,
            },
            {
                $set: {
                    items: [],
                    totalAmount: 0,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Demo payment successful. Order confirmed.",
            payment: {
                transactionId,
                status: "paid",
            },
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                totalAmount: order.totalAmount,
            },
        });

    } catch (error) {
        console.error("Verify Demo Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while verifying demo payment.",
        });
    }
};