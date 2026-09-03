const Product = require("../Models/Product");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product creation failed",
      error: error.message
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Products fetching failed",
      error: error.message
    });
  }
};

// Filterable/text search used by the chat agent - GET /api/products only
// ever returned the entire catalog with no way to narrow it down
exports.searchProducts = async (req, res) => {
  try {
    const { q, category, color, size, minPrice, maxPrice, discount, sort, limit } = req.query;
    const filter = {};

    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    if (color) filter.colors = new RegExp(`^${escapeRegex(color)}$`, "i");
    if (size) filter.sizes = new RegExp(`^${escapeRegex(size)}$`, "i");

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (discount === "true") {
      filter.discount = { $gt: 0 };
    }

    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }

    let query = Product.find(filter);

    if (sort === "price_asc") query = query.sort({ price: 1 });
    if (sort === "price_desc") query = query.sort({ price: -1 });

    const products = await query.limit(limit ? Number(limit) : 20);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product search failed",
      error: error.message
    });
  }
};

// Per size/color availability - Product.stock is an array of
// { size, color, quantity }, so a plain product fetch can't answer
// "is this in stock in blue, size M" on its own
exports.checkAvailability = async (req, res) => {
  try {
    const { size, color } = req.query;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let quantity;
    if (size || color) {
      const variant = product.stock.find(
        (v) => (!size || v.size === size) && (!color || v.color === color)
      );
      quantity = variant ? variant.quantity : 0;
    } else {
      quantity = product.stock.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        size: size || null,
        color: color || null,
        quantity,
        inStock: quantity > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Availability check failed",
      error: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product fetching failed",
      error: error.message
    });
  }
};
