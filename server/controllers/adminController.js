import User from "../models/User.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";

export const getPendingHosts = async (req, res) => {
  try {
    const hosts = await User.find({
      role: "host",
      status: "pending",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hosts.length,
      hosts,
    });
  } catch (error) {
    console.error("Get Pending Hosts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending hosts.",
    });
  }
};


export const updateHostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or blocked.",
      });
    }

    const host = await User.findOne({
      _id: id,
      role: "host",
    });

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found.",
      });
    }

    host.status = status;

    await host.save();

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Host approved successfully."
          : "Host blocked successfully.",
      host: {
        id: host._id,
        firstName: host.firstName,
        lastName: host.lastName,
        email: host.email,
        role: host.role,
        status: host.status,
      },
    });
  } catch (error) {
    console.error("Update Host Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating host status.",
    });
  }
};


// Get Admin Stat
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalHosts,
      pendingHosts,
      activeHosts,
      blockedHosts,
      totalStores,
      activeStores,
      totalProducts,
      activeProducts,
      outOfStockProducts,
    ] = await Promise.all([
      // Users
      User.countDocuments({
        role: "user",
      }),

      // Hosts
      User.countDocuments({
        role: "host",
      }),

      // Pending hosts
      User.countDocuments({
        role: "host",
        status: "pending",
      }),

      // Active hosts
      User.countDocuments({
        role: "host",
        status: "active",
      }),

      // Blocked hosts
      User.countDocuments({
        role: "host",
        status: "blocked",
      }),

      // Stores
      Store.countDocuments(),

      // Active stores
      Store.countDocuments({
        status: "active",
      }),

      // Products
      Product.countDocuments(),

      // Active products
      Product.countDocuments({
        status: "active",
      }),

      // Out of stock
      Product.countDocuments({
        status: "out_of_stock",
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
        },

        hosts: {
          total: totalHosts,
          pending: pendingHosts,
          active: activeHosts,
          blocked: blockedHosts,
        },

        stores: {
          total: totalStores,
          active: activeStores,
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts,
        },
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin statistics.",
    });
  }
};


//Host Management
export const getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({
      role: "host",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hosts.length,
      hosts,
    });
  } catch (error) {
    console.error("Get All Hosts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching hosts.",
    });
  }
};


//Host Details
export const getHostDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const host = await User.findOne({
      _id: id,
      role: "host",
    }).select("-password");

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found.",
      });
    }

    return res.status(200).json({
      success: true,
      host,
    });
  } catch (error) {
    console.error("Get Host Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching host details.",
    });
  }
};


// Store Management
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate(
        "owner",
        "firstName lastName email phone role status profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
    console.error("Get All Stores Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching stores.",
    });
  }
};


export const getStoreDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id).populate(
      "owner",
      "firstName lastName email phone role status profileImage createdAt"
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    return res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get Store Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching store details.",
    });
  }
};


export const updateStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store status.",
      });
    }

    const store = await Store.findById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    store.status = status;

    await store.save();

    return res.status(200).json({
      success: true,
      message: `Store status updated to ${status}.`,
      store,
    });
  } catch (error) {
    console.error("Update Store Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating store status.",
    });
  }
};


//Product management
export const getAllProductsForAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate(
        "store",
        "storeName status logo"
      )
      .populate(
        "seller",
        "firstName lastName email phone status"
      )
      .populate(
        "category",
        "name"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get All Products Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products.",
    });
  }
};


export const getAdminProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate(
        "store",
        "storeName description logo banner address gstNumber rating totalReviews status"
      )
      .populate(
        "seller",
        "firstName lastName email phone profileImage status createdAt"
      )
      .populate(
        "category",
        "name description image status"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Admin Product Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product details.",
    });
  }
};


export const updateProductStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Admin can only set product status to active or inactive.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // If product has no stock, don't activate it
    if (status === "active" && product.stock === 0) {
      return res.status(400).json({
        success: false,
        message: "Product cannot be activated because it is out of stock.",
      });
    }

    product.status = status;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Product activated successfully."
          : "Product deactivated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Admin Product Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating product status.",
    });
  }
};