
import { Product } from "../../modules/productSchema.js";

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Destructure all fields out of req.body populated by Multer
    const { name, brand, category, description, price, stock, rating, existingImages } = req.body;

    // 2. Validate that critical string properties arrived safely
    if (!brand) {
      return res.status(400).json({ success: false, message: "Brand field is missing in backend payload." });
    }

    // 3. Handle image configuration logic
    let finalImages = [];
    if (existingImages) {
      // Parse the JSON string array sent down by your frontend state
      finalImages = JSON.parse(existingImages); 
    }

    // 4. If new image files were uploaded, add their paths to the final array
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newImagePaths];
    }

    // 5. Update the document against the database
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        brand, // Explicit field pass
        category,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        rating: parseInt(rating, 10) || 1,
        images: finalImages
      },
      { new: true, runValidators: true } // Fires Mongoose validation rules safely
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Update error log:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



