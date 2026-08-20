import Product from "../models/Product.js";
import Store from "../models/Store.js";
import Category from "../models/Category.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      images,
      price,
      discount,
      stock,
      sku,
      specifications,
    } = req.body;

    // Validate req fields
    if (
      !name ||
      !description ||
      !category ||
      price === undefined ||
      stock === undefined ||
      !sku
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, category, price, stock and SKU are required.",
      });
    }

    // find host's store
    const store = await Store.findOne({
      owner: req.user._id,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found. Please create a store first.",
      });
    }

    // check category
    const existingCategory = await Category.findOne({
      _id: category,
      status: "active",
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive.",
      });
    }

    // check duplicate sku
    const existingSKU = await Product.findOne({
      sku: sku.toUpperCase().trim(),
    });

    if (existingSKU) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists.",
      });
    }

    // validate price
    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    // validate stock
    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative.",
      });
    }

    // validate discount
    const productDiscount = Number(discount) || 0;

    if (productDiscount < 0 || productDiscount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100.",
      });
    }

    // calculate final price
    const productPrice = Number(price);

    const finalPrice = Number(
      (productPrice - (productPrice * productDiscount) / 100).toFixed(2),
    );

    // generate slug
    const slug = `${name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now()}`;

    // determine product status
    let productStatus = "active";

    if (Number(stock) === 0) {
      productStatus = "out_of_stock";
    }

    // create product
    const product = await Product.create({
      store: store._id,
      seller: req.user._id,
      category: existingCategory._id,

      name: name.trim(),
      slug,

      description: description.trim(),
      brand: brand?.trim(),

      images: Array.isArray(images) ? images : [],

      price: productPrice,
      discount: productDiscount,
      finalPrice,

      stock: Number(stock),

      sku: sku.toUpperCase().trim(),

      specifications: specifications || {},

      status: productStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating product.",
    });
  }
};
