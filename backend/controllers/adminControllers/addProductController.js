import { Product } from "../../modules/productSchema.js";

export const addProductController = async (req, res, next) => {
  try {
    const { id } = req.params; // Populates if updating via PUT route parameters
    const isUpdateMode = req.method === 'PUT' || !!id;

    const { name, description, price, category, stock, brand, rating, shopId, specifications, newArrival } = req.body;
    const images = req.files?.map((file) => file.path) || [];

    // Safe multi-part JSON form parser check
    let parsedSpecifications = [];
    if (specifications) {
      if (typeof specifications === "string") {
        try {
          parsedSpecifications = JSON.parse(specifications);
        } catch (parseErr) {
          return res.status(400).json({
            success: false,
            message: "Invalid format for specifications. Must be a valid JSON array.",
          });
        }
      } else if (Array.isArray(specifications)) {
        parsedSpecifications = specifications;
      }
    }

    // Explicitly parse incoming multi-part form string boolean payload safely
    const isNewArrival = newArrival === true || newArrival === "true";

    if (isUpdateMode) {
      // 1. UPDATE MODE LOGIC ENGINE (PUT)
      const updateData = {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock, 10),
        brand,
        rating: parseFloat(rating),
        specifications: parsedSpecifications,
        // Dynamically applies the evaluated boolean value rather than hardcoded false state
        newArrival: isNewArrival 
      };

      // Only push and append new images if the user actually uploaded new ones
      if (images.length > 0) {
        updateData.images = images;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Target product record not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });

    }
    else {
      // 2. CREATE MODE LOGIC ENGINE (POST)
      const product = await Product.create({
        name,
        description,
        price: parseFloat(price) || 0,
        category,
        stock: parseInt(stock, 10) || 0,
        brand: brand || "Generic", 
        rating: parseFloat(rating) || 1, 
        images,
        shop: shopId || "STARTECH", 
        status: "APPROVED", 
        specifications: parsedSpecifications,
        // Dynamically checks your dynamic frontend input variables on item creation instances
        newArrival: isNewArrival
      });

      return res.status(201).json({
        success: true,
        message: "Product created and approved successfully",
        product,
      });
    }
  } catch (err) {
    next(err);
  }
};