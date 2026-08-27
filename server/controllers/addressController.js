import Address from "../models/Address.js";


// Get all addresses
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user: req.user._id,
        }).sort({
            isDefault: -1,
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: addresses.length,
            addresses,
        });
    } catch (error) {
        console.error("Get Addresses Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching addresses.",
        });
    }
};


// Add address
export const addAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            addressType,
            isDefault,
        } = req.body;

        if (
            !fullName ||
            !phone ||
            !addressLine1 ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "All required address fields are required.",
            });
        }

        // If this is the first address, make it default
        const existingAddress = await Address.findOne({
            user: req.user._id,
        });

        const shouldBeDefault =
            !existingAddress || isDefault === true;

        // Remove default from old addresses
        if (shouldBeDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            user: req.user._id,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            addressType: addressType || "home",
            isDefault: shouldBeDefault,
        });

        return res.status(201).json({
            success: true,
            message: "Address added successfully.",
            address,
        });
    } catch (error) {
        console.error("Add Address Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding address.",
        });
    }
};


// Update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            addressType,
            isDefault,
        } = req.body;

        if (isDefault === true) {
            await Address.updateMany(
                { user: req.user._id },
                { isDefault: false }
            );
        }

        address.fullName = fullName ?? address.fullName;
        address.phone = phone ?? address.phone;
        address.addressLine1 =
            addressLine1 ?? address.addressLine1;
        address.addressLine2 =
            addressLine2 ?? address.addressLine2;
        address.city = city ?? address.city;
        address.state = state ?? address.state;
        address.pincode = pincode ?? address.pincode;
        address.landmark = landmark ?? address.landmark;
        address.addressType =
            addressType ?? address.addressType;

        if (isDefault !== undefined) {
            address.isDefault = isDefault;
        }

        await address.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully.",
            address,
        });
    } catch (error) {
        console.error("Update Address Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating address.",
        });
    }
};


// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOneAndDelete({
            _id: id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        // If deleted address was default,
        // make another address default
        if (address.isDefault) {
            const nextAddress = await Address.findOne({
                user: req.user._id,
            }).sort({
                createdAt: -1,
            });

            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Address Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting address.",
        });
    }
};


// Set default address
export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        await Address.updateMany(
            { user: req.user._id },
            { isDefault: false }
        );

        address.isDefault = true;

        await address.save();

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully.",
            address,
        });
    } catch (error) {
        console.error("Set Default Address Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while setting default address.",
        });
    }
};