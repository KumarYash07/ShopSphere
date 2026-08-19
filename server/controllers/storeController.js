import Store from "../models/Store.js";

export const createStore = async (req, res) => {
  try {
    const { storeName, description, gstNumber, address } = req.body;

    //only host can create store
    if (req.user.role !== "host") {
      return res.status(403).json({
        success: false,
        message: "Only hosts can create a store",
      });
    }

    //host must be approved
    if (req.user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved yet!",
      });
    }

    if (!storeName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required.",
      });
    }

    // Check if host already has a store
    const existingStore = await Store.findOne({
      owner: req.user._id,
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "You already have a store.",
      });
    }

    const store = await Store.create({
      owner: req.user._id,
      storeName,
      description,
      gstNumber,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully.",
      store,
    });
  } catch (error) {
    console.error("Create Store Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating store.",
    });
  }
};

export const getMyStore = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get Store Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching store.",
    });
  }
};


export const updateMyStore = async (req, res) => {
  try {
    const {
      storeName,
      description,
      gstNumber,
      address,
      logo,
      banner,
    } = req.body;

    const store = await Store.findOne({
      owner: req.user._id,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    if (storeName !== undefined) {
      store.storeName = storeName;
    }

    if (description !== undefined) {
      store.description = description;
    }

    if (gstNumber !== undefined) {
      store.gstNumber = gstNumber;
    }

    if (address !== undefined) {
      store.address = address;
    }

    if (logo !== undefined) {
      store.logo = logo;
    }

    if (banner !== undefined) {
      store.banner = banner;
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: "Store updated successfully.",
      store,
    });
  } catch (error) {
    console.error("Update Store Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating store.",
    });
  }
};