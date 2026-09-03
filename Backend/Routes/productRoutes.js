const express = require("express");
const productController = require("../Controllers/productController");
const { protect, adminOnly } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, productController.createProduct);
router.get("/", productController.getProducts);

// Must come before "/:id" or Express will treat "search" as an :id value
router.get("/search", productController.searchProducts);
router.get("/:id/availability", productController.checkAvailability);
router.get("/:id", productController.getProductById);

router.get("/search", async (req, res) => {
  try {
    const {
      keyword,
      category,
      color,
      size,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};

    if (keyword) {
      filter.name = {
        $regex: keyword,
        $options: "i",
      };
    }

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (color || size) {
      filter.variants = {
        $elemMatch: {},
      };

      if (color) {
        filter.variants.$elemMatch.color = {
          $regex: color,
          $options: "i",
        };
      }

      if (size) {
        filter.variants.$elemMatch.size = {
          $regex: size,
          $options: "i",
        };
      }
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/:id/availability/check", async (req, res) => {
  try {
    const { color, size } = req.query;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variant = product.variants.find(
      (item) =>
        item.color.toLowerCase() === color.toLowerCase() &&
        item.size.toLowerCase() === size.toLowerCase()
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        available: false,
        message: "Color and size combination not found",
      });
    }

    res.status(200).json({
      success: true,
      available: variant.stock > 0,
      stock: variant.stock,
      message:
        variant.stock > 0
          ? `${color} size ${size} is available`
          : `${color} size ${size} is out of stock`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Availability check failed",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product fetching failed",
      error: error.message,
    });
  }
});

module.exports = router;