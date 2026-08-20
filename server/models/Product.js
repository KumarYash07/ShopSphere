import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Store that owns this product
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    // Host/Seller who created the product
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Product category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Product images
    images: [
      {
        type: String,
      },
    ],

    // Original price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Discount percentage
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Final selling price
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Available stock
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Unique product code
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Product-specific information
    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;