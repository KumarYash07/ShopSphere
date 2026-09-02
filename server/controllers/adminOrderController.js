import Order from "../models/Order.js";


// ==========================================
// Get All Orders
// ==========================================

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate(
                "user",
                "firstName lastName email phone"
            )
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
        console.error("Get All Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching orders.",
        });
    }
};


// ==========================================
// Get Single Order
// ==========================================

export const getAdminOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate(
                "user",
                "firstName lastName email phone"
            )
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
        console.error("Get Admin Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching order.",
        });
    }
};


// ==========================================
// Update Order Status
// ==========================================

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, cancellationReason } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: "Order status is required.",
            });
        }

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status.",
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // Prevent changing a cancelled order
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be updated.",
            });
        }

        // ==========================================
        // Update Order Status
        // ==========================================

        order.orderStatus = orderStatus;


        // ==========================================
        // Delivered
        // ==========================================

        if (orderStatus === "delivered") {

            order.deliveredAt = new Date();

            // COD payment is collected on delivery
            if (order.paymentMethod === "cod") {
                order.paymentStatus = "paid";
            }
        }


        // ==========================================
        // Cancelled
        // ==========================================

        if (orderStatus === "cancelled") {

            order.cancelledAt = new Date();

            if (cancellationReason) {
                order.cancellationReason =
                    cancellationReason.trim();
            } else {
                order.cancellationReason =
                    "Cancelled by admin";
            }
        }


        await order.save();


        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",

            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                deliveredAt: order.deliveredAt,
                cancelledAt: order.cancelledAt,
                cancellationReason:
                    order.cancellationReason,
            },
        });

    } catch (error) {
        console.error("Update Order Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating order.",
        });
    }
};


// ==========================================
// Revenue Dashboard
// ==========================================

export const getRevenueStats = async (req, res) => {
    try {

        // ==========================================
        // Revenue
        // ==========================================
        // Only PAID + NON-CANCELLED orders
        // are counted in revenue.

        const revenueData = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    orderStatus: {
                        $ne: "cancelled",
                    },
                },
            },

            {
                $group: {
                    _id: null,

                    totalRevenue: {
                        $sum: "$totalAmount",
                    },

                    totalPaidOrders: {
                        $sum: 1,
                    },
                },
            },
        ]);


        // ==========================================
        // Order Statistics
        // ==========================================

        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);


        // ==========================================
        // Payment Statistics
        // ==========================================

        const paymentStats = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);


        // ==========================================
        // Total Orders
        // ==========================================

        const totalOrders =
            await Order.countDocuments();


        const revenue =
            revenueData.length > 0
                ? revenueData[0]
                : {
                    totalRevenue: 0,
                    totalPaidOrders: 0,
                };


        return res.status(200).json({

            success: true,

            revenue: {
                totalRevenue:
                    revenue.totalRevenue,

                totalPaidOrders:
                    revenue.totalPaidOrders,
            },

            orders: {
                total: totalOrders,
                byStatus: orderStats,
            },

            payments: {
                byStatus: paymentStats,
            },
        });

    } catch (error) {

        console.error(
            "Get Revenue Stats Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching revenue statistics.",
        });
    }
};