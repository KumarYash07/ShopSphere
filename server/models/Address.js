import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        addressLine2: {
            type: String,
            trim: true,
            maxlength: 200,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
        },

        landmark: {
            type: String,
            trim: true,
            maxlength: 100,
        },

        addressType: {
            type: String,
            enum: ["home", "work", "other"],
            default: "home",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;