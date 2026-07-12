const express = require("express");
const Order = require("../Models/Order");
const Customer = require("../Models/Customer");
const Product = require("../Models/Product");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { customerId, products } = req.body;

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const variant = product.variants.find(
        (v) =>
          v.color.toLowerCase() === item.color.toLowerCase() &&
          v.size.toLowerCase() === item.size.toLowerCase()
      );

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: "Selected color and size not available",
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} pieces available`,
        });
      }
    }

    const orderCount = await Order.countDocuments();

    const order = await Order.create({
      ...req.body,
      orderId: `ORD-${1001 + orderCount}`,
    });

    for (const item of products) {
      const product = await Product.findById(item.productId);

      const variant = product.variants.find(
        (v) =>
          v.color.toLowerCase() === item.color.toLowerCase() &&
          v.size.toLowerCase() === item.size.toLowerCase()
      );

      variant.stock -= item.quantity;

      await product.save();
    }

    await Customer.findByIdAndUpdate(
      customerId,
      {
        $push: {
          orderHistory: order._id,
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .populate("products.productId");

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Orders fetching failed",
      error: error.message,
    });
  }
});

router.get("/track/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order tracking fetched successfully",
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order tracking failed",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId")
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order fetching failed",
      error: error.message,
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        paymentStatus: req.body.paymentStatus,
        trackingNumber: req.body.trackingNumber,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order status update failed",
      error: error.message,
    });
  }
});

module.exports = router;