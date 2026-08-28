import Product from "../models/Product.js";
import Store from "../models/Store.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

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

export const getProducts = async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, sort } = req.query;

    // Build filter
    const filter = {
      status: "active",
      stock: { $gt: 0 },
    };

    // Search by product name or brand
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.finalPrice = {};

      if (minPrice !== undefined) {
        filter.finalPrice.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.finalPrice.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price_low") {
      sortOption = {
        finalPrice: 1,
      };
    }

    if (sort === "price_high") {
      sortOption = {
        finalPrice: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("store", "storeName logo")
      .populate("seller", "firstName lastName")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products.",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      status: "active",
    })
      .populate("category", "name slug")
      .populate("store", "storeName logo banner rating")
      .populate("seller", "firstName lastName");

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
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product.",
    });
  }
};

//Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      category,
      brand,
      images,
      price,
      discount,
      stock,
      specifications,
    } = req.body;

    //Find Product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    //Ownership Check
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own products.",
      });
    }

    //Category validation
    if (category !== undefined) {
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

      product.category = category;
    }

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (brand !== undefined) {
      product.brand = brand.trim();
    }

    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : [];
    }

    if (specifications !== undefined) {
      product.specifications = specifications;
    }

    // Price
    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative.",
        });
      }

      product.price = Number(price);
    }

    // Discount
    if (discount !== undefined) {
      const newDiscount = Number(discount);

      if (newDiscount < 0 || newDiscount > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100.",
        });
      }
      product.discount = newDiscount;
    }

    // Stock
    if (stock !== undefined) {
      if (Number(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative.",
        });
      }

      product.stock = Number(stock);
    }

    // Recalculate final price
    product.finalPrice = Number(
      (product.price - (product.price * product.discount) / 100).toFixed(2),
    );

    // Update status based on stock
    if (product.stock === 0) {
      product.status = "out_of_stock";
    } else if (product.status === "out_of_stock") {
      product.status = "active";
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating product.",
    });
  }
};

//Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ownership check
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products.",
      });
    }

    // Soft delete
    product.status = "inactive";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting product.",
    });
  }
};

//Update product stock
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stock is required.",
      });
    }

    const newStock = Number(stock);

    if (!Number.isInteger(newStock) || newStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ownership check
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own products.",
      });
    }

    product.stock = newStock;

    if (newStock === 0) {
      product.status = "out_of_stock";
    } else if (product.status === "out_of_stock") {
      product.status = "active";
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully.",
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("Update Stock Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating stock.",
    });
  }
};

//Update Product discount
export const updateProductDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount } = req.body;

    if (discount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Discount is required.",
      });
    }

    const newDiscount = Number(discount);

    if (newDiscount < 0 || newDiscount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ownership check
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own products.",
      });
    }

    product.discount = newDiscount;

    // Recalculate final price
    product.finalPrice = Number(
      (product.price - (product.price * newDiscount) / 100).toFixed(2),
    );

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Discount updated successfully.",
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        finalPrice: product.finalPrice,
      },
    });
  } catch (error) {
    console.error("Update Discount Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating discount.",
    });
  }
};


//Image Upload
export const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ownership check
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own products.",
      });
    }

    // Check files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image.",
      });
    }

    // Maximum 5 images
    if (product.images.length + req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "A product can have maximum 5 images.",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "shopsphere/products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(file.buffer);
      });

      uploadedImages.push(imageUrl);
    }

    // Add URLs to product
    product.images.push(...uploadedImages);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product images uploaded successfully.",
      images: product.images,
    });
  } catch (error) {
    console.error("Upload Product Images Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while uploading images.",
    });
  }
};

// Get Host's Products
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
    })
      .populate("category", "name slug")
      .populate("store", "storeName logo")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get My Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your products.",
    });
  }
};