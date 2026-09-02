import Order from "../models/Order.js";
import Store from "../models/Store.js";


// ==========================================
// Get Host Orders
// ==========================================

export const getHostOrders = async (req, res) => {
    try {
        // Find host's active store
        const store = await Store.findOne({
            owner: req.user._id,
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found.",
            });
        }

        const orders = await Order.find({
            "items.store": store._id,
        })
            .populate(
                "user",
                "firstName lastName email phone"
            )
            .populate(
                "items.product",
                "name images price"
            )
            .populate(
                "items.store",
                "storeName"
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
        console.error("Get Host Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching host orders.",
        });
    }
};


// ==========================================
// Get Single Host Order
// ==========================================

export const getHostOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findOne({
            owner: req.user._id,
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found.",
            });
        }

        const order = await Order.findOne({
            _id: id,
            "items.store": store._id,
        })
            .populate(
                "user",
                "firstName lastName email phone"
            )
            .populate(
                "items.product",
                "name images price"
            )
            .populate(
                "items.store",
                "storeName"
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
        console.error("Get Host Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching order.",
        });
    }
};

// ==========================================
// Update Host Order Status
// ==========================================

export const updateHostOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const allowedStatuses = [
            "confirmed",
            "processing",
            "shipped",
            "delivered",
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
                message: "Invalid order status for host.",
            });
        }

        // Find host's store
        const store = await Store.findOne({
            owner: req.user._id,
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found.",
            });
        }

        // Find order belonging to this host's store
        const order = await Order.findOne({
            _id: id,
            "items.store": store._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // Cancelled orders cannot be updated
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be updated.",
            });
        }

        // Update order status
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

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",

            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                deliveredAt: order.deliveredAt,
            },
        });

    } catch (error) {
        console.error(
            "Update Host Order Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while updating order status.",
        });
    }
};


// Host Revenue Dashboard
export const getHostRevenueStats = async (req, res) => {
    try {
        const store = await Store.findOne({
            owner: req.user._id,
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found.",
            });
        }

        // Revenue from this host's store only
        const revenueData = await Order.aggregate([
            {
                $match: {
                    "items.store": store._id,
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

        // Order status statistics
        const orderStats = await Order.aggregate([
            {
                $match: {
                    "items.store": store._id,
                },
            },
            {
                $group: {
                    _id: "$orderStatus",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

        // Payment statistics
        const paymentStats = await Order.aggregate([
            {
                $match: {
                    "items.store": store._id,
                },
            },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

        // Total orders for this host
        const totalOrders = await Order.countDocuments({
            "items.store": store._id,
        });

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
                totalRevenue: revenue.totalRevenue,
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
            "Get Host Revenue Stats Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching host revenue statistics.",
        });
    }
};