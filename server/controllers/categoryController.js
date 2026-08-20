import Category from "../models/Category.js";

//Create
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const normalizedName = name.trim();

    //check duplicate
    const existingCategory = await Category.findOne({
      name: normalizedName,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists.",
      });
    }

    //Generate slug
    const slug = normalizedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await Category.create({
      name: normalizedName,
      slug,
      description,
      image,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.log("Create Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating category.",
    });
  }
};

//Get All Category
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      status: "active",
    }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.log("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories.",
    });
  }
};

//Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    if (name !== undefined) {
      const normalizedName = name.trim();

      const duplicate = await Category.findOne({
        name: normalizedName,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another category with this name already exists.",
        });
      }

      category.name = normalizedName;

      category.slug = normalizedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (status !== undefined) {
      category.status = status;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating category.",
    });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    category.status = "inactive";

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully.",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting category.",
    });
  }
};
