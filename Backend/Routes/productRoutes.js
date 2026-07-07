const express = require("express");
const Product = require("../Models/Product");

const router = express.Router();

router.post("/", async (req, res) => {
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
});

router.get("/", async (req, res) => {
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
});

module.exports = router;