
  import { Product } from "../../modules/productSchema.js";
import fs from "fs";
import path from "path";

export const deleteProductController = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Find the target product to retrieve its image file references
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Loop through and delete each file in the uploads directory
    if (product.images && product.images.length > 0) {
      product.images.forEach((imagePath) => {
        // Resolve the exact path to the file on your server
        const fullPath = path.resolve(imagePath);

        // Check if the file exists before attempting deletion to avoid server crashes
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Failed to delete file: ${fullPath}`, err);
            } else {
              console.log(`Successfully purged asset: ${fullPath}`);
            }
          });
        }
      });
    }

    // 3. Remove the document from MongoDB
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product and associated server files removed successfully.",
    });
  } catch (err) {
    next(err);
  }
};